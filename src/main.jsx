import Rx from 'rxjs'
import ops from 'rxjs/operators'

Rx.fromEvent(document, 'ondeviceready').pipe(
	ops.delay(5000),
	ops.map(() => document.getElementById("deviceready")),
	ops.take(1),
).subscribe(element => {
	var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
})
