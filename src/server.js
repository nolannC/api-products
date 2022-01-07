require('dotenv').config();
const express = require('express');
const joi = require('joi');

const fs = require('fs');
const path = require('path');

const pathProductsJSON = path.join(__dirname, './data/products.json');

const products = JSON.parse(fs.readFileSync(pathProductsJSON).toString());

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
	res.send('Home');
});

app.get('/api/products', (req, res) => {
	res.status(200).send(products);
});

app.post('/api/products', (req, res) => {
	const product = req.body;

	const productPOSTSchema = joi.object({
		title: joi.string().min(3).max(100).required(),
		price: joi.number().integer().precision(2).min(0.01).required(),
		description: joi.string().min(10).max(800).required(),
		category: joi.string().min(3).max(20).required(),
		image: joi
			.string()
			.pattern(
				/^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/
			)
			.required(),
		rating: joi.object({
			rate: joi.number().integer().precision(1).min(0).max(5).required(),
			count: joi.number().integer().min(1).required()
		})
	});

	const { error } = productPOSTSchema.validate(product);
	if (error) {
		return res.status(400).send(error.details[0].message);
	}

	product.id = products[products.length - 1].id + 1;
	products.push(product);

	res.status(201).send(products);
});

app.delete('/api/products/:id', (req, res) => {
	const productID = parseInt(req.params.id);
	const product = products.find(p => p.id === productID);
	if (!product) {
		return res.status(404).send('Product not found with the given id');
	}

	products.splice(products.indexOf(product), 1);
	res.status(200).send(product);
});

app.get('/api/products/:id', (req, res) => {
	const productID = parseInt(req.params.id);
	const product = products.find(p => p.id === productID);
	if (!product) {
		return res.status(404).send('Product not found with the given id');
	}
	res.status(200).send(product);
});

app.put('/api/products/:id', (req, res) => {
	const productID = parseInt(req.params.id);
	const changes = req.body;
	console.log(changes);

	const product = products.find(p => p.id === productID);

	if (!product) {
		return res.status(402).send('Product not found with the given id');
	}

	const productPUTSchema = joi.object({
		id: joi.number().integer().min(1),
		title: joi.string().min(3).max(100),
		price: joi.number().integer().precision(2).min(0.01),
		description: joi.string().min(10).max(800),
		category: joi.string().min(3).max(20),
		image: joi
			.string()
			.pattern(
				/^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/
			),
		rating: joi.object({
			rate: joi.number().integer().precision(1).min(0).max(5),
			count: joi.number().integer().min(1)
		})
	});

	const { error } = productPUTSchema.validate(changes);
	if (error) {
		return res.status(400).send(error.details[0].message);
	}

	for (const key in changes) {
		product[key] = changes[key];
	}

	res.status(201).send(product);
});

app.listen(process.env.PORT || 3000, () => 
	console.log(`Listening on port ${process.env.PORT || 3000}...`)
);

// TODO:
/*
1 - Display only the message when there is an error with the schema
2 - POST Schema
3 - Refactor the position of the schema
4 - Create a function to parse errors (!product && schema)
*/
