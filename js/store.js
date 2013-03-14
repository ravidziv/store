(function() {
	//The modle that represents one Product
    
	var Product = Backbone.Model.extend({})
	
    var ProductCollection = Backbone.Collection.extend({
        model: Product,

        initialize: function(models, options) {
            this.url = options.url;
        },

        comparator: function(item) {
            return item.get('title');
        }
    });
	
	//A model that represents a product that has selected 
    var Item = Backbone.Model.extend({
        update: function(amount) {
			//If we want to reduce the product
			if (amount==-1){
				this.set({'quantity': 0}, {silent: true});
			}
			else{
				this.set({'quantity': amount}, {silent: true});
			}
			//Show the Shopping Basket
            this.collection.trigger('change', this);
        },
        price: function() {
            console.log(this.get('product').get('title'), this.get('quantity'));
            return this.get('product').get('price') * this.get('quantity');
        }
    });
	//The collection that stores all the products that selected.
    var ItemCollection = Backbone.Collection.extend({
        model: Item,
		
        getOrCreateItemForProduct: function(product) {
            var i, 
            pid = product.get('id'),
            o = this.detect(function(obj) { 
                return (obj.get('product').get('id') == pid); 
            });
            if (o) { 
                return o;
            }
            i = new Item({'product': product, 'quantity': 0})
            this.add(i, {silent: true})
            return i;
        },

        getTotalCount: function() {
            return this.reduce(function(memo, obj) { 
                return obj.get('quantity') + memo; }, 0);
        },


        getTotalCost: function() {
            return this.reduce(function(memo, obj) { 
                return obj.price() + memo; }, 0);
        }	
    });

	//A view that all the other views that conetect to products are Inheritance from it.
    var _BaseView = Backbone.View.extend({
        parent: $('#main'),
        className: 'viewport',

        initialize: function() {
            this.el = $(this.el);
            this.el.hide();
            this.parent.append(this.el);
            return this;
        },

        hide: function() {
            if (this.el.is(":visible") === false) {
                return null;
            }
            promise = $.Deferred(_.bind(function(dfd) { 
                this.el.fadeOut('fast', dfd.resolve)}, this));
            return promise.promise();
        },

        show: function() {
            if (this.el.is(':visible')) {
                return;
            }       
            promise = $.Deferred(_.bind(function(dfd) { 
                this.el.fadeIn('fast', dfd.resolve) }, this))
            return promise.promise();
        }
    });

	//The view of all the Products in the store.
    var ProductListView = _BaseView.extend({
        id: 'productlistview',
        template: $("#store_index_template").html(),

        initialize: function(options) {
			this.cart = options.cart;
            this.constructor.__super__.initialize.apply(this, [options]);
            this.collection.bind('reset', _.bind(this.render, this));
        },

        render: function() {
            this.el.html(_.template(this.template, 
                                    {'products': this.collection.toJSON()}))
            return this;
        },
		
		events:{
			"click .add" : "update",
		},
		//Update the list if the user inserts  or remove a Product.
		update: function(e){
				var proud = this.collection.detect(function(obj) { 
					return (obj.get('id')== $(e.target).data("name").substr(1));
					});
				var item = this.cart.getOrCreateItemForProduct(proud);
					if ($(e.target).val()=="Add to the list"){
						$(e.target).prop('value', 'Remove from the list');
					item.update(1);
				}
				else{
					$(e.target).prop('value', 'Add to the list')
					item.update(-1);
					}
				
		}
    });

	//the view of the Shopping Basket.
    var CartWidget = Backbone.View.extend({
        el: $('.cart-info'),
          template : {
			regTemplate : $('#store_cart_template').html(),
			defaultTamplate : $('#store_EmptyCrat_template').html()
		},

        initialize: function() {
            this.collection.bind('change', _.bind(this.render, this));
			this.render();
        },
        
        render: function() {
			//If the basket is empty.
			if (this.collection.getTotalCount()==0){
				this.el.html(_.template(this.template['defaultTamplate'])).animate({paddingTop: '30px'})
					.animate({paddingTop: '10px'});
				}
			else{ 
				this.el.html(
					_.template(this.template['regTemplate'], {
						'count': this.collection.getTotalCount(),
						'cost': this.collection.getTotalCost()
					})).animate({paddingTop: '30px'})
					.animate({paddingTop: '10px'});
				}
			}
    });
	//The view of the page that get the deatails from the user before the submit
	var totalView = _BaseView.extend({
		    el: $('.sub'),
			template: $('#submit_template').html(),	
			initialize: function() {
        },
		
        events:{
			"click #submit" : "submitForm",
			"keypress .number" : "checkForNumber"
		},
		
        render: function() {
            this.el.html(
                _.template(this.template, {
                    'count': this.collection.getTotalCount(),
                    'cost': this.collection.getTotalCost()
                }));
				return this;
        },
		//Validate if the user inserets all is Details. 
		validate: function (){
				   var $nameInput =  $('#name').val();
				   var $cardInput= $('#cardNum').val();
				   var ordered = this.collection.length;
				   if($nameInput == '' || $cardInput =='' || ordered==0) {
						if (ordered==0){
							alert("You didnt order anything");
						}
						else{
							alert ("You most fill all the fileds");
						}
						e.preventDefault();  	
						return false;
				   }
				 else{
					return true;
				 }
		},
		//Send the Details of the transaction after the user press on the submit button
		 submitForm: function(){
			 if (this.validate()){	
				//all the products that the user ordered
				 var product="";
				 $.each(this.collection.models, function() {
					 product= product + ", "+this.attributes.product.id;
				}); 
				var details ="totalCost="+this.collection.getTotalCost()+"&markets="+product+"&"+$('#ContactForm').serialize();
				$.ajax({type:'POST', url: 'index.php', 
				 data: details,
					success: function(response) {
						alert(response);
						location.reload();
					}
				})
			}
		},
		//Check if the use inserets a number to the filed.
		checkForNumber:(function(ev){
			var iKeyCode = ev.which || ev.keyCode;
			var aSpecialKeysForFirefox = [8, 9, 13, 27, 37, 38, 39, 40, 46];
			var sKey = String.fromCharCode(iKeyCode);
			if (sKey !== "" && $.inArray(iKeyCode, aSpecialKeysForFirefox ) < 0 && !sKey.match(/[0-9]/)) {
				alert("In this filed you can insert only numbers");
				ev.preventDefault();
			}
		}),	
	});
	
	//The general Router of the app.
    var BackboneStore = Backbone.Router.extend({
        views: {},
        products: null,
        cart: null,

        routes: {
            "": "index",
			"submit1": "defualtOrder"
			
        },
		
        initialize: function(data) {
            this.cart = new ItemCollection();
            new CartWidget({collection: this.cart});
			this.totalView =  new totalView({collection: this.cart});
			//load the data of the products from the server.
            this.products = new ProductCollection([], {
                url: 'getCatalog.php'});
            this.views = {
                '_index': new ProductListView({
                    collection: this.products, cart: this.cart
                })
            };
			
            $.when(this.products.fetch({reset: true}))
                .then(function() { window.location.hash = ''; });
            return this;
        },
		//hides all the products views
        hideAllViews: function () {
            return _.select(
                _.map(this.views, function(v) { return v.hide(); }), 
                function (t) { return t != null });
        },
		//shows the products views when we back to the main page.
        index: function() {
            var view = this.views['_index'];
			$("#sub").hide();
            $.when(this.hideAllViews()).then(
                function() { return view.show(); });
        },

        product: function(id) {
            var product, v, view;
            product = this.products.detect(function(p) { return p.get('id') == (id); });
            $.when(this.hideAllViews()).then(
                function() { view.show(); });
        },
		//When the user press the order button.
		defualtOrder: function(){
			this.hideAllViews();
			this.totalView.render();
			$("#sub").show();
		}
    });
	
    $(document).ready(function() {
		//Start the app.
        new BackboneStore();
        Backbone.history.start();
    });

}).call(this);
