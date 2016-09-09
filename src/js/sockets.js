var satoshi = 100000000;

var DELAY_CAP = 1000;

var lastBlockHeight = 0;

/** @constructor */
function TransactionSocket() {

}

TransactionSocket.init = function() {
	// Terminate previous connection, if any
	if (TransactionSocket.connection)
		TransactionSocket.connection.close();

	var connection = io.connect('http://insight.masternode.io:3000');
	TransactionSocket.connection = connection;

	connection.on('connect', function () {
		console.log('insight.masternode.io:3000: Connection open!');
		connection.emit('subscribe', 'inv');
	});

	connection.on('disconnect', function() {
		console.log('insight.masternode.io:3000: Connection closed');
	});

	connection.on('error', function(error) {
		console.log('insight.masternode.io:3000: Connection Error: ' + error);
	});


	function newTx(bitcoins, isDonation, currency, currencyName, isIX) {
		new Transaction(bitcoins, isDonation, currency, currencyName, isIX);
	}

	function spawnTransaction(data, isIX){
		console.log('insight.masternode.io:3000: tx data: ' + JSON.stringify(data) + ' vout length: ' + data.vout.length);

		// Dash volume is quite low - show bubble for every output
		// var transacted = 0;
		var vout = data.vout;
		for (var i = 0; i < vout.length; i++) {
			// transacted += vout[i][Object.keys(vout[i])];
			// console.log('insight.masternode.io:3000: tx data: ' + Object.keys(vout[i]) + ' ' + vout[i][Object.keys(vout[i])]);
			var bitcoins = vout[i][Object.keys(vout[i])] / satoshi;
			setTimeout(newTx(bitcoins,
							Object.keys(vout[i]) == DONATION_ADDRESS,
							'', '', isIX),
				isIX ? 0 : Math.random() * DELAY_CAP);
			// console.log('insight.masternode.io:3000: tx data: ' + transacted);
		}

		// var bitcoins = transacted / satoshi;
		// var bitcoins = data.valueOut;
		// console.log("Transaction: " + bitcoins + " BTC");

		// var donation = false;
		// var soundDonation = false;
		// var vout = data.vout;
		// for (var j = 0; j < vout.length; j++) {
		// 	if (Object.keys(vout[j]) == DONATION_ADDRESS) {
		// 		bitcoins = vout[j][[Object.keys(vout[j])]] / satoshi;
		// 		new Transaction(bitcoins, true);
		// 		return;
		// 	}
		// }

		// setTimeout(function() {
		// 	new Transaction(bitcoins);
		// }, Math.random() * DELAY_CAP);
	}

	connection.on("tx", function(data){
		spawnTransaction(data, false);
	});

	connection.on("ix", function(data){
		spawnTransaction(data, true);
	});

	connection.on("block", function(blockHash){
		// console.log('insight.masternode.io:3000: blockHash: ' + blockHash);
		$.getJSON('http://insight.masternode.io:3000/api/block/' + blockHash, function(blockData) {
			// console.log('insight.masternode.io:3000: blockData: ' + JSON.stringify(blockData));
			var blockHeight = blockData.height;
			var transactions = blockData.tx.length;
			// no such info in insight-api :(
			// var volumeSent = blockData.total_out;
			// let's show difficulty instead
			var difficulty = blockData.difficulty;
			var blockSize = blockData.size;
			// Filter out the orphaned blocks.
			if (blockHeight > lastBlockHeight) {
				lastBlockHeight = blockHeight;
				console.log("New Block");
				new Block(blockHeight, transactions, /*volumeSent*/difficulty, blockSize);
			}
		});
	});
};

TransactionSocket.close = function() {
	if (TransactionSocket.connection) {
		TransactionSocket.connection.close();
	}
};

/** @constructor */
function TradeSocket() {

}

TradeSocket.init = function() {
	var channel_id = "dbf1dee9-4f2e-4a08-8cb7-748919a71b21"; // Channel id for BTC trades

	// Terminate previous connection, if any
	if (TradeSocket.connection)
		TradeSocket.connection.close();

	var connection = PUBNUB.init({
        publish_key   : 'demo',
        subscribe_key : 'sub-c-50d56e1e-2fd9-11e3-a041-02ee2ddab7fe',
		ssl : true
    });
	TradeSocket.connection = connection;

	connection.close = function() {
		connection.unsubscribe({channel : channel_id});
		connection.onclose();
	};

	connection.onmessage = function(message) {
		//console.log(message);
			if (message.trade) {
				//console.log("Trade: " + message.trade.amount_int / satoshi + " BTC | " + (message.trade.price * message.trade.amount_int / satoshi) + " " + message.trade.price_currency);
				// 0.57 BTC | 42.75 USD

				var bitcoins = message.trade.amount_int / satoshi;
				var currency = (message.trade.price * message.trade.amount_int / satoshi);
				var currencyName = message.trade.price_currency;

				setTimeout(function() {
					new Transaction(bitcoins, false, currency, currencyName);
				}, Math.random() * DELAY_CAP);
			}
	};

	connection.onopen = function() {
			console.log('Mt.Gox: Connection open!');
			StatusBox.connected("mtgox");
	};

	connection.onclose = function() {
		console.log('Mt.Gox: Connection closed');
	};

	connection.subscribe({
        channel : channel_id,
        message : connection.onmessage,
        connect : connection.onopen,
		disconnect : connection.onclose,
		reconnect : connection.onopen
    });
};

TradeSocket.close = function() {
	if (TradeSocket.connection)
		TradeSocket.connection.close();
	StatusBox.closed("mtgox");
};

export {
	TradeSocket: TradeSocket,
	TransactionSocket: TransactionSocket
}