/*import Rx from 'rxjs'
import ops from 'rxjs/operators'

Rx.fromEvent(document, 'deviceready').pipe(
    ops.map(() => document.getElementById("deviceready")),
    ops.take(1),
).subscribe(element => {
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
})
*/

import { fromEvent } from 'rxjs'
import { map, delay, take } from 'rxjs/operators'

const deviceReady = fromEvent(document, 'deviceready');

deviceReady.pipe(
    delay(5000),
    take(1),
    map(() => document.getElementById('deviceready'))
).subscribe(parentElement => {
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    cordova.plugins.firebase.analytics.logEvent("test_event", {param: "value"});
})
