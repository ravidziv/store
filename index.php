<?php
/* This file managers all the request that came from the client side.
It contains two object, one to stores the data and the second one to make the 
actions (Insert in our case)
*/
include "DataBaseObject.php";

class order {
	var $name;
	var $totalCost;
	var $markets;
	var $cardNum;
	 function order(){
		 $this->name =  $_POST['name'];
		 $this->totalCost = $_POST['totalCost'];
		 $this->markets = $_POST['markets'];
		 $this->cardNum = $_POST['cardNum'];
		 } 

 }
 
 class orderService{
	var $order;
	function orderService()
	{
		$this->order=  new order();
	}
	
	function insertToOrder(){
		$order=  new order();
		$query = "Insert into count (name,cardNum,price, markets) VALUES ('$order->name',$order->cardNum,$order->totalCost,
		'$order->markets');";
		mysql_query($query);

	}
 }
 
if ($_POST['name']){
	$cone= new createConnection();
	$cone->create();
	$service = new orderService();
	$service->insertToOrder();
}
?>
    Thenk You, Your order is accepted.
	<?php
  die();
?>