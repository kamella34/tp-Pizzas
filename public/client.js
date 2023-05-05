const socket = io();
console.log(socket);

socket.on("client:connecte:ok", () => {
    console.log('Message bien reçu du serveur !')
})

let p = document.getElementById('realTps');

socket.on('serveur:newPizza',(pizza)=>{
    console.log(pizza);
    console.log(pizza.libelle_pizza);
    p.innerText = pizza.libelle_pizza;
}) 

socket.emit('serveur:newPizza',(pizza)=>{

}) 

    
let btnsAjout = document.querySelectorAll('.btnAjout');
let displayCounts = document.querySelectorAll('.idcount');
let btnRetirer = document.querySelectorAll('.btnRetirer');

for (let i = 0; i < btnsAjout.length; i++) {
  let count = 0;
  btnsAjout[i].addEventListener("click", (event) => {
    count++;
    displayCounts[i].textContent = count;
   
  });

  btnRetirer[i].addEventListener("click", (event) => {
    if (count > 0) {
      count--;
      displayCounts[i].textContent = count;
      
    }
  });
}



