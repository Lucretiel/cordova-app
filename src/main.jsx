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

import {fromEvent} from 'rxjs'

fromEvent(document, 'deviceready').subscribe(() => {
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log("BAMBAM")
    })
