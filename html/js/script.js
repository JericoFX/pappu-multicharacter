const WelcomePercentage = '30vh';
let selectedChar = null;
let qbMultiCharacters = {};
let translations = {};
let Loaded = false;
let NChar = null;
let EnableDeleteButton = false;
const dollar = Intl.NumberFormat('en-US');

$(document).ready(() => {
  window.addEventListener('message', handleMessage);
  $('.datepicker').datepicker();
});

function handleMessage(event) {
  const data = event.data;
  if (data.action === 'ui') {
    handleUIAction(data);
  } else if (data.action === 'setupCharacters') {
    setupCharacters(
      data.characters,
      data.photo1,
      data.photo2,
      data.photo3,
      data.photo4
    );
  }
}

function handleUIAction(data) {
  NChar = data.nChar;
  EnableDeleteButton = data.enableDeleteButton;
  translations = data.translations;

  if (data.toggle) {
    showWelcomeScreen();
  } else {
    hideWelcomeScreen();
  }
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
      SetLocal();
    }, 500);
  }, 2000);
}

function hideWelcomeScreen() {
  $('.container').fadeOut(250);
  qbMultiCharacters.resetAll();
}

function loadingAnimation() {
  let loadingText = 'Loading';
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

async function getBase64Image(
  src,
  removeImageBackGround,
  callback,
  outputFormat
) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = src;

  img.onload = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const selectedSize = 320;
    canvas.height = selectedSize;
    canvas.width = selectedSize;
    ctx.drawImage(img, 0, 0, selectedSize, selectedSize);
    await removeBackGround(canvas);
    const dataURL = canvas.toDataURL(outputFormat);
    callback(dataURL);
  };

  img.onerror = () => callback(translations['default_image']);
}

async function removeBackGround(canvas) {
  const ctx = canvas.getContext('2d');
  const net = await bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2,
  });

  const { data: map } = await net.segmentPerson(canvas, {
    internalResolution: 'medium',
  });

  const { data: imgData } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const newImg = ctx.createImageData(canvas.width, canvas.height);
  const newImgData = newImg.data;

  for (let i = 0; i < map.length; i++) {
    const [r, g, b, a] = [
      imgData[i * 4],
      imgData[i * 4 + 1],
      imgData[i * 4 + 2],
      imgData[i * 4 + 3],
    ];
    [
      newImgData[i * 4],
      newImgData[i * 4 + 1],
      newImgData[i * 4 + 2],
      newImgData[i * 4 + 3],
    ] = !map[i] ? [255, 255, 255, 0] : [r, g, b, a];
  }

  ctx.putImageData(newImg, 0, 0);
}

function SetLocal() {
  $('.characters-text').html(translations['characters_header']);
}

function setupCharacters(characters, photo1, photo2, photo3, photo4) {
  $('.characters-text2').html(
    `${characters.length}/ ${NChar} ${translations['characters_count']}`
  );
  setCharactersList(characters.length);

  characters.forEach((char) => {
    const charElement = $(`#char-${char.cid}`);
    charElement.html('');
    charElement.data('citizenid', char.citizenid);

    let tempUrl = getPhotoUrl(char.cid, photo1, photo2, photo3, photo4);

    setTimeout(() => {
      if (tempUrl === translations['default_image']) {
        setDefaultCharacter(charElement, char, tempUrl);
      } else {
        getBase64Image(tempUrl, true, (dataUrl) => {
          setCharacter(charElement, char, dataUrl);
        });
      }
    }, 100);
  });
}

function getPhotoUrl(cid, photo1, photo2, photo3, photo4) {
  const photos = [photo1, photo2, photo3, photo4];
  const photo = photos[cid - 1];
  if (photo && photo !== 'none') {
    return `https://nui-img/${photo}/${photo}?t=${Math.round(
      new Date().getTime() / 1000
    )}`;
  }
  return translations['default_image'];
}

function setDefaultCharacter(element, char, tempUrl) {
  element.html(getCharacterHTML(char, tempUrl));
  element.data('cData', char);
  element.data('cid', char.cid);
}

function setCharacter(element, char, tempUrl) {
  element.html(getCharacterHTML(char, tempUrl));
  element.data('cData', char);
  element.data('cid', char.cid);
}

function getCharacterHTML(char, tempUrl) {
  return `
        <div class="character-div">
            <div class="user"> 
                <img src="${tempUrl}" alt="${char.cid} photo" />
            </div>
            <span id="slot-name">${char.charinfo.firstname} ${char.charinfo.lastname}
                <span id="cid">${char.citizenid}</span>
            </span>
            <div class="user3">
                <img src="${translations['default_right_image']}" alt="plus" />
            </div>
        </div>
        <div class="btns">
            <div class="character-btn" id="select" style="display: block;">
                <p id="select-text"><i>${translations['select']}</i></p>
            </div>
        </div>
    `;
}

$(document).on('click', '#close-log', function (e) {
  e.preventDefault();
  selectedLog = null;
  $('.welcomescreen').css('filter', 'none');
  $('. container').fadeOut(250);
});

$(document).on('click', '.character-btn', function (e) {
  e.preventDefault();
  const charElement = $(this)
    .closest('.characters-list')
    .find('.character-div');
  const charData = charElement.data('cData');
  const cid = charElement.data('cid');
  selectedChar = charData;
  qbMultiCharacters.resetAll();
  $.post(
    'https://pappu-multicharacter/selectCharacter',
    JSON.stringify({ cid })
  );
  setTimeout(() => {
    $.post('https://pappu-multicharacter/removeBlur');
    SetLocal();
  }, 500);
});
