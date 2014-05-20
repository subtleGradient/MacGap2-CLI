define("macgap/bridge", function(require, exports, module) {

	var macgap = require('macgap'),
		utils = require('macgap/utils'),
		messageIframe,
		messageQueue = [],
		messageHandlers = {},
		responseCallacks = {},
		uniqueId = 1;

	var CUSTOM_PROTOCOL_SCHEME = 'mgscheme';
	var QUEUE_HAS_MESSAGE = '__MG_QUEUE_MESSAGE__';

	var Bridge = {
		init: init,
		send: send,
		registerHandler: registerHandler,
		callHandler: callHandler,
		_fetchQueue: _fetchQueue,
		_handleMessageFromObjC: _handleMessageFromObjC
	}

	function createMessageIframe(doc) {
		messageIframe = doc.createElement('iframe')
		messageIframe.style.display = 'none'
		doc.documentElement.appendChild(messageIframe)
		return messageIframe;
	}

	function fetchQueue() {
		var messageQueueString = JSON.stringify(messageQueue);
		sendMessageQueue = [];
		return messageQueueString
	}

	function send(message, responseCallback) {
		if (responseCallback) {
			var callbackId = 'cb_' + (uniqueId++) + '_' + new Date().getTime()
			responseCallbacks[callbackId] = responseCallback
			message['callbackId'] = callbackId
		}
		messageQueue.push(message)
		messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE
	}

	

	function dispatchMessageFromObjC(messageJSON) {
		setTimeout(function _timeoutDispatchMessageFromObjC() {
			var message = JSON.parse(messageJSON)
			var messageHandler

			if (message.responseId) {
				var responseCallback = responseCallbacks[message.responseId]
				if (!responseCallback) {
					return;
				}
				responseCallback(message.responseData)
				delete responseCallbacks[message.responseId]
			} else {
				var responseCallback
				if (message.callbackId) {
					var callbackResponseId = message.callbackId
					responseCallback = function(responseData) {
						_doSend({
							responseId: callbackResponseId,
							responseData: responseData
						})
					}
				}

				var handler = Bridge._messageHandler
				if (message.handlerName) {
					handler = messageHandlers[message.handlerName]
				}

				try {
					handler(message.data, responseCallback)
				} catch (exception) {
					if (typeof console != 'undefined') {
						console.log("Bridge: WARNING: javascript handler threw.", message, exception)
					}
				}
			}
		})
	}

	function handleMessageFromObjC(messageJSON) {
		if (receiveMessageQueue) {
			receiveMessageQueue.push(messageJSON)
		} else {
			_dispatchMessageFromObjC(messageJSON)
		}
	}

	function send(data, responseCallback) {
		_doSend({
			data: data
		}, responseCallback)
	}

	function registerHandler(handlerName, handler) {
		messageHandlers[handlerName] = handler
	}

	

	function init(messageHandler) {
		if (Bridge._messageHandler) {
			throw new Error('Bridge.init called twice')
		}
		Bridge._messageHandler = messageHandler
		var receivedMessages = receiveMessageQueue
		receiveMessageQueue = null
		for (var i = 0; i < receivedMessages.length; i++) {
			_dispatchMessageFromObjC(receivedMessages[i])
		}
	}


	function callHandler(handlerName, data, responseCallback) {
		_doSend({
			handlerName: handlerName,
			data: data
		}, responseCallback)
	}


	var doc = document
	_createQueueReadyIframe(doc)
	var readyEvent = doc.createEvent('Events')
	readyEvent.initEvent('BridgeReady')
	readyEvent.bridge = Bridge
	doc.dispatchEvent(readyEvent)


	module.exports = bridge;

});
