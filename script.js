const game = document.getElementById("game")
const ship = document.getElementById("ship")

let shipX = game.offsetWidth / 2

let icebergs = []

let distance = 0
let avoided = 0
let level = 1

let speed = 2
let gameRunning = true

function createIceberg(){

let iceberg = document.createElement("div")
iceberg.className = "iceberg"
iceberg.innerHTML = "🧊"

let x = Math.random() * (game.offsetWidth - 30)

iceberg.style.left = x + "px"
iceberg.style.top = "-30px"

game.appendChild(iceberg)

icebergs.push(iceberg)

}

function updateGame(){

if(!gameRunning) return

distance += 1

document.getElementById("distance").innerText = distance

if(distance % 1000 === 0){

level++
speed += 0.5

document.getElementById("level").innerText = level

}

icebergs.forEach((iceberg,index)=>{

let top = parseFloat(iceberg.style.top)

top += speed

iceberg.style.top = top + "px"

let icebergX = parseFloat(iceberg.style.left)

let shipLeft = ship.offsetLeft

if(top > game.offsetHeight){

iceberg.remove()
icebergs.splice(index,1)

avoided++
document.getElementById("avoided").innerText = avoided

}

if(
top > game.offsetHeight - 80 &&
icebergX < shipLeft + 40 &&
icebergX + 30 > shipLeft
){

collision()

}

})

}

function moveLeft(){

shipX -= 40

if(shipX < 0) shipX = 0

ship.style.left = shipX + "px"

}

function moveRight(){

shipX += 40

if(shipX > game.offsetWidth - 40) shipX = game.offsetWidth - 40

ship.style.left = shipX + "px"

}

function collision(){

gameRunning = false

document.getElementById("collision").classList.remove("hidden")

document.getElementById("finalDistance").innerText = distance
document.getElementById("finalAvoided").innerText = avoided

}

function restart(){

location.reload()

}

setInterval(createIceberg,1500)

setInterval(updateGame,20)