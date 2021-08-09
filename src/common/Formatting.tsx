export const colors = {
  primary: "#945EFC",
  // 'primary': "#A267E6",
  positive: "#7DD185FF",
  positiveLight: "#7DD185B3",
  negative: "#E57CA3FF",
  negativeLight: "#E57CA3B3",

  grayUltraLight: "#C8C8C8",
  grayLight: "#8D99AE",
  grayMedium: "#707A8B",
  grayDark: "#373A3E",
  grayUltraDark: "#212529",
  black: "#000",

  // theme
  themeBlue: "#6382B7FF",
  themeBlueLight: "#6382B7B3",
  themeBlueUltraLight: "#6382B71A",
  themeBlueDark: "#6382B7FF",

  // google
  googlePrimary: "#3f51b5",

  // standard
  // 'background': "#141B2DFF",
  background: "#292929FF",
  paper: "#FFFFFFFF",
  // 'menu': "#FFFFFF26",
  menu: "#212529FF",
  // 'card': "#FFFFFF12",
  card: "#1A1D20FF",
  // 'box': "#FFFFFF1A",
  box: "#00000040",
  boxOpaque: "#141B2DFF",
  text: "#FFFFFFB3",
  // 'username': "#BA8DF6B3",
  username: "#FFFFFFB3",
  portfolioText: "#FFFFFF80",
  graphLine: "#FFFFFF80",
};

export const numberFormat = Intl.NumberFormat();

export const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const datetimeString = (timestamp: number) => {
  var a = new Date(timestamp);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  // var sec = a.getSeconds();
  return month
    ? month.toUpperCase() +
        " " +
        date +
        " " +
        year +
        " " +
        String(hour).padStart(2, "0") +
        ":" +
        String(min).padStart(2, "0")
    : "";
};

export const dateStringUTC = (timestamp: number) => {
  var a = new Date(timestamp);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getUTCFullYear();
  var month = months[a.getUTCMonth()];
  var date = a.getUTCDate();
  return month ? month.toUpperCase() + " " + date + " " + year : "";
};

/**
 * Resize a base 64 Image
 * @param {String} base64 - The base64 string (must include MIME type)
 * @param {Number} newWidth - The width of the image in pixels
 * @param {Number} newHeight - The height of the image in pixels
 */
// https://stackoverflow.com/questions/20379027/javascript-reduce-the-size-and-quality-of-image-with-based64-encoded-code
export const resizeBase64Img = (
  base64: string,
  newWidth: number,
  newHeight: number
) => {
  return new Promise((resolve, reject) => {
    var canvas = document.createElement("canvas");
    canvas.style.width = newWidth.toString() + "px";
    canvas.style.height = newHeight.toString() + "px";
    let context: CanvasRenderingContext2D | null = canvas.getContext("2d");
    let img = document.createElement("img");
    img.src = base64;
    img.onload = function () {
      if (context != null) {
        context.scale(newWidth / img.width, newHeight / img.height);
        context.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
      }
    };
  });
};
