/* fonte dei dati:
https://data.mendeley.com/datasets/24wf5n2gk5/1
*/

let table; //variabile che conterrà l'intero dataset del CSV
let books = []; // array vuoto
let shelfHeight = 120; // spazio verticale in pixel tra gli scaffali

async function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Monserrat');

  table = await loadTable('assets/libri.csv', ',', 'header');

//il ciclo scorre riga per riga tutto il CSV:
//table.getRow estrae la singola riga
//row.getString e row.getNum estraggono stringhe di testo o numeri dalle colonne specifiche del dataset
  for (let r = 0; r < table.getRowCount(); r++) {
    let row = table.getRow(r);
    
    let gender = row.getString('Gender');
    let age = row.getNum('Age');
    let genre = row.getString('Favorite books for reading to spend leisure time');
    let timeSpent = row.getNum('Amount of time spent reading books per day');
    let dept = row.getString('Department');

     //books.push prende i dati estratti e li mette nel glifo libro, aggiungendoli all'array prima vuoto "books"
    books.push({
      gender: gender,
      age: age,
      genre: genre,
      timeSpent: timeSpent,
      dept: dept,
      
     // con map mappo le dimensioni del glifo libro: lo spessore proporzionale alle ore di lettura, l'altezza proporzionale all'età
      thickness: map(timeSpent, 0, 5, 5, 20), // converte le ore di lettura (da 0 a 5) in larghezza tra 5 e 20px
      height: map(age, 18, 25, 50, 90) // converte età (tra 18 e 25 anni) in un'altezza tra 50 e 90px
    });
  }
}

function draw() {
  background(212, 163, 115);
  drawHeader(); //titolo
  drawLegend(40, 80); //legenda

 //punti di partenza fissi del primo libro
  let startX = 40;
  let startY = 200;
  //coordinate correnti che si spostano man mano che si fisegnano i libri
  let currentX = startX;
  let currentY = startY;
  
  let hoveredBook = null; // variabile che memorizza su quale libro si sta facendo hover
  let hoveredPos = { x: 0, y: 0 }; // variabile che salva le coordinate del mouse quando si attiva il rollover, per sapere dove far comparire il riquadro informativo

  // disegna il primo scaffale
  drawShelf(currentY);

  for (let b of books) { //è un ciclo che scorre uno per uno i libri nell'array books. b rappresenta il singolo libro analzzato di volta in volta
    // se il libro supera il margine destro passa allo scaffale successivo
    if (currentX + b.thickness > windowWidth - 40) {
      currentX = startX;
      currentY += shelfHeight; //abbassa la coordinata verticale dello scaffale aggiungendo l'altezza della mensola
      drawShelf(currentY);
    }

    //coordinate per paritre a diseganre il rettangolo del libro
    let x = currentX;
    let y = currentY - b.height; // così il libro poggia sullo scaffale

    // Controllo se il mouse è sopra il libro
    let isHovered = mouseX >= x && mouseX <= x + b.thickness && mouseY >= y && mouseY <= currentY;
    // mouseX >= x vericia se il mouse è a destra del bordo sinistro del libro)
    // mouseX <= x + b.thickness se il mouse è a sinistra del bordo destro
    // mouseY >= y se il mouse è sotto la cima del libro
    // mouseY <= currentY se il mouse è sopra la mensola
    // se tutte e quattro le condizioni sono vere, isHovered diventa true


    // disegna libro
    drawBook(x, y, b.thickness, b.height, b.gender, b.genre, isHovered);

    if (isHovered) {
      hoveredBook = b; 
      hoveredPos = { x: mouseX, y: mouseY }; //se isHovered è vero salva il libro corrente dentro hoveredBook
    }

    currentX += b.thickness + 2; // spaziatura tra un libro e l'altro
  }

  //se un libro è sotto l'hover viene chiamata la funzione drawTooltip che disegna il riquadro con i dettagli
  if (hoveredBook) {
    drawTooltip(hoveredBook, hoveredPos.x, hoveredPos.y);
  }
}



// disegna una singola spina di libro
function drawBook(x, y, w, h, gender, genre, isHovered) {
  push();
  
  // colore che cambia in base al genere
  let bookColor;
  if (gender === 'Female') {
    bookColor = color(120, 0, 0);
  } else if (gender === 'Male') {
    bookColor = color(0, 48, 73);
  }

  //all'hover il contorno cambia, sennò il contorno è un tratto scuro
  if (isHovered) {
    stroke(247, 243, 227);
    strokeWeight(2);
  } else {
    noStroke();
  }

  // disegna il corpo del libro
  fill(bookColor);
  rect(x, y, w, h);

  pop();
}


// disegna  mensola
function drawShelf(y) {
  push();
  stroke(153, 88, 42);
  strokeWeight(6);
  line(30, y, width - 30, y);
  pop();
}


// disegna titolo
function drawHeader() {
  push();
  fill(0);
  textSize(22);
  textStyle(BOLD);
  text("Abitudini di lettura tra studenti universitari", 40, 45);
  pop();
}


// disegna la legenda
function drawLegend(x, y) {
  push();
  textStyle(BOLDITALIC);
  // spiega i colori delle spine
  fill(0, 48, 73); 
  text("Uomini", x, y);

  fill(120, 0, 0); 
  text("Donne", x + 75, y);

  // spiega spessore e altezza
  fill(0);
  text("Larghezza libro: ore di lettura al giorno", x + 150, y);
  text("Altezza libro: età del lettore", x + 380, y);
  pop();
}


// disegna tooltip con i dati prefisi
function drawTooltip(book, x, y) {
  push();
  let boxW = 210; //larghezza del rettangolo informativo
  let boxH = 95; //altezza

  //il riquadro appare a destra e sopra il mouse (x+15 e y-boxH-10), 
  // MA se il mouse si trova troppo vicino al bordo destro o superiore dello schermo, la funzione constrain(valore, minimo, massimo) 
  // prende la coordinata e la forza a rimanere sempre dentro i confini dello schermo
  let px = constrain(x + 15, 10, width - boxW - 10);
  let py = constrain(y - boxH - 10, 10, height - boxH - 10); //lascia almeno 10 px dai bordi

  //disegna il riquadro
  fill(0);
  noStroke();
  rect(px, py, boxW, boxH, 6); //6 è il border radius

  //scritte dentro al riquadro
  fill(255);
  noStroke();
  textSize(11);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  text(`Dipartimento del lettore: ${book.dept}`, px + 10, py + 8); //margine interno di 10px a sinistra e 8px dall'alto
  text(`Genere: ${book.gender}`, px + 10, py + 26);
  text(`Età: ${book.age} anni`, px + 10, py + 42);
  text(`Genere preferito: ${book.genre}`, px + 10, py + 58);
  text(`Ore di lettura al giorno: ${book.timeSpent}h`, px + 10, py + 74);
  pop();
}