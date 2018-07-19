const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const dir = local => path.resolve(__dirname, local)
const isProd = process.env.NODE_ENV === 'production'


module.exports = {
	context: dir("src"),
	entry: "./main.jsx",
	output: {
		path: dir("www/js"),
		filename: "bundle.js",
	},
	resolve: {
		modules: [
			dir("src"),
			dir("node_modules"),
		],
	},
	module: {
		rules: [{
			test: /\.jsx?$/,
			exclude: dir('node_modules'),
			use: [{
				loader: 'babel-loader',
				options: {
					presets: ['react', 'env'],
				}
			}]
		}],
	},
}
