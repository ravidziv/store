<?php
/* This file create connection to the Server, creates 
the dataBase, creates tables and inseres them the Initial values.
*/

include "DataBaseObject.php";
//Creates the connection
$cone= new createConnection();
$cone->create();

$cone->createDB();
$cone->dropTable();
$sql="CREATE TABLE IF NOT EXISTS datatable(id varchar(30),title text,comapny text, image text, price float)";
$cone->creatTable($sql);
$cone->insertToDB();
$sql="CREATE TABLE IF NOT EXISTS count (name VARCHAR(30),cardNum INT(11),price INT(11), markets text)";
$cone->creatTable($sql);
?>