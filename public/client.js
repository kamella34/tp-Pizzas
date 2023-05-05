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
let btnsRetirer = document.querySelectorAll('.btnRetirer');
let btnValider = document.querySelector('.btnValidePizza');
let totalPizza = document.getElementById('total')
let counts;

for (let i = 0; i < btnsAjout.length; i++) {
  let count = 0;
  btnsAjout[i].addEventListener("click", (event) => {
    count++;
    displayCounts[i].innerHTML = count;
  });

  btnsRetirer[i].addEventListener("click", (event) => {
    if (count > 0) {
      count--;
      displayCounts[i].innerHTML = count; 
    }
  });

}

btnValider.addEventListener('click', (event) => {
 counts = 0
  for (let i = 0; i < displayCounts.length; i++) {
    counts += parseInt(displayCounts[i].textContent);
    totalPizza.innerHTML = `Panier ${counts}`
  }
 
});
     
