import {LittleJSonH} from './LittleJSonH.js';

console.log("_______________")

let test="* * * * *"
let l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="1 * * * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* 1 * * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* * 1 * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="1/1 * * * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* * * * SUN"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* * * JUL *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* 0-12/2 * * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* * 1,3 * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

test="* * */14 * *"
l= new LittleJSonH(test); 
console.log(test+" : "+l.human)

console.log("_______________\ntest nextT()")
test="* * * * *"
l= new LittleJSonH(test);
console.log(test+" : "+l.human)
console.log(l.currentTime)
l.nextT()
console.log(l.currentTime)

test="30 2 10 MAR *"
l= new LittleJSonH(test);
console.log(test+" : "+l.human)
console.log(l.currentTime)
l.nextT()
console.log(l.currentTime)

test="* * 1/14 * *"
l= new LittleJSonH(test);
console.log(test+" : "+l.human)
console.log(l.currentTime)
l.nextT()
console.log(l.currentTime)



console.log("_______________")
console.log("the end")