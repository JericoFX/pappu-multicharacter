const WELCOME_PERCENTAGE = '30vh';
let selectedChar = null;
let qbMultiCharacters = {};
let translations = {};
let loaded = false;
let nChar = null;
let enableDeleteButton = false;
const dollar = Intl.NumberFormat('en-US');

$(document).ready(() => {
  window.addEventListener('message', handleMessage);
  $('.datepicker').datepicker();
  initCharacterEvents();
});

function handleMessage(event) {
  const { action, data } = event.data;
  if (action === 'ui') {
    handleUIAction(data);
  } else if (action === 'setupCharacters') {
    setupCharacters(data.characters, data.photos);
  }
}

function handleUIAction({ toggle, nChar, enableDeleteButton, translations }) {
  nChar = nChar;
  enableDeleteButton = enableDeleteButton;
  translations = translations;

  toggle ? showWelcomeScreen() : hideWelcomeScreen();
}

function showWelcomeScreen() {
  $('.container').show();
  $('.welcomescreen').fadeIn(150);
  qbMultiCharacters.resetAll();
  loadingAnimation();

  setTimeout(() => {
    $.post('https://pappu-multicharacter/setupCharacters');
    setTimeout(() => {
      $('.welcomescreen').fadeOut(150);
      showCharacterList();
      $.post('https://pappu-multicharacter/removeBlur');
      setLocalText();
    }, 500);
  }, 2000);
}

function hideWelcomeScreen() {
  $('.container').fadeOut(250);
  qbMultiCharacters.resetAll();
}

function loadingAnimation() {
  let loadingText = 'Cargando';
  let loadingDots = 0;
  const loadingInterval = setInterval(() => {
    loadingDots = (loadingDots + 1) % 4;
    $('#loading-text').html(loadingText + '.'.repeat(loadingDots));
  }, 500);

  setTimeout(() => clearInterval(loadingInterval), 5000);
}

function showCharacterList() {
  qbMultiCharacters.fadeInDown('.characters-list', '80.6%', 1);
  qbMultiCharacters.fadeInDown('.bar', '79%', 1);
  qbMultiCharacters.fadeInDown('.bar2', '78.92%', 1);
  qbMultiCharacters.fadeInDown('.characters-icon', '66.66%', 1);
  qbMultiCharacters.fadeInDown('.characters-text', '70.26%', 1);
  qbMultiCharacters.fadeInDown('.characters-text2', '72.66%', 1);
  $('.btns').css({ display: 'flex' });
}

async function getBase64Image(src, callback, outputFormat = 'image/png') {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = src;

  img.onload = async () => {
    const canvas = document.createElement('canvas');
    canvas.height = canvas.width = 320;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    await removeBackGround(canvas);
    callback(canvas.toDataURL(outputFormat));
  };

  img.onerror = () => callback(translations.default_image);
}

async function removeBackGround(canvas) {
  const ctx = canvas.getContext('2d');
  const net = await bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2,
  });
  const map = await net.segmentPerson(canvas, { internalResolution: 'medium' });
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const newImgData = ctx.createImageData(canvas.width, canvas.height).data;

  map.forEach((val, i) => {
    const [r, g, b, a] = [
      imgData[i * 4],
      imgData[i * 4 + 1],
      imgData[i * 4 + 2],
      imgData[i * 4 + 3],
    ];
    if (!val)
      [
        newImgData[i * 4],
        newImgData[i * 4 + 1],
        newImgData[i * 4 + 2],
        newImgData[i * 4 + 3],
      ] = [255, 255, 255, 0];
    else
      [
        newImgData[i * 4],
        newImgData[i * 4 + 1],
        newImgData[i * 4 + 2],
        newImgData[i * 4 + 3],
      ] = [r, g, b, a];
  });

  ctx.putImageData(
    new ImageData(newImgData, canvas.width, canvas.height),
    0,
    0
  );
}

function setLocalText() {
  $('.characters-text').html(translations.characters_header);
}

function setupCharacters(characters, photos) {
  $('.characters-text2').html(
    `${characters.length}/ ${nChar} ${translations.characters_count}`
  );
  setCharactersList(characters.length);

  characters.forEach((char, idx) => {
    const charElement = $(`#char-${char.cid}`);
    charElement.html('').data('citizenid', char.citizenid);
    const photoUrl = photos[idx] || translations.default_image;

    setTimeout(() => {
      if (photoUrl === translations.default_image) {
        setCharacterElement(charElement, char, photoUrl);
      } else {
        getBase64Image(photoUrl, (dataUrl) => {
          setCharacterElement(charElement, char, dataUrl);
        });
      }
    }, 100);
  });
}

function setCharacterElement(element, char, imageUrl) {
  element.html(getCharacterHTML(char, imageUrl));
  element.data({ cData: char, cid: char.cid });
}

function getCharacterHTML(char, imageUrl) {
  return `
    <div class="character-div">
      <div class="user">
        <img src="${imageUrl}" alt="${char.cid} photo" />
      </div>
      <span id="slot-name">${char.charinfo.firstname} ${char.charinfo.lastname}
        <span id="cid">${char.citizenid}</span>
      </span>
      <div class="user3">
        <img src="${translations.default_right_image}" alt="plus" />
      </div>
    </div>
    <div class="btns">
      <div class="character-btn" id="select" style="display: block;">
        <p id="select-text"><i>${translations.select}</i></p>
      </div>
    </div>`;
}

function initCharacterEvents() {
  $(document).on('click', '#close-log', (e) => {
    e.preventDefault();
    $('.welcomescreen').css('filter', 'none');
    $('.container').fadeOut(250);
  });

  $(document).on('click', '.character-btn', function (e) {
    e.preventDefault();
    const charElement = $(this)
      .closest('.characters-list')
      .find('.character-div');
    selectedChar = charElement.data('cData');
    qbMultiCharacters.resetAll();
    $.post(
      'https://pappu-multicharacter/selectCharacter',
      JSON.stringify({ cid: charElement.data('cid') })
    );
    setTimeout(() => {
      $.post('https://pappu-multicharacter/removeBlur');
      setLocalText();
    }, 500);
  });
}
