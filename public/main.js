function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

async function loadImage({prev, images, index}){
    const uri = 'http://localhost:3000/api/files/' + images[index];
    const res = await(fetch(uri));
    const blob = await res.blob();
    if(prev){
        URL.revokeObjectURL(prev);
    }
    const image = URL.createObjectURL(blob);
    document.querySelector('img').src = image;

    const max = images.length;
    const next = (index + 1) % max;
    setTimeout(() => {
        loadImage({prev: image, images, index: next});
    }, 10000);
}

(async () => {
    const res = await fetch('http://localhost:3000/api/files')
    const images = await res.json();
    shuffle(images);
    loadImage({images, index:0})
})();
