import React from "react";
// import { mediaPath } from "../../firebase";
// import { colors } from '../common/Formatting'
import "./Swap.css";

// interface Props {
// }

// displays an image and text side-by-side
export default function Swap() {
  // var titleSize = "6vw"
  // var textSize = "2vw"
  // var width = "50%"
  // var padding = 10
  // var marginSides = "30px"
  // var paddingVertical = padding.toString()+"%"
  // if ((padding / 100) * window.innerWidth < 30) {
  //     paddingVertical = "30px"
  // }
  // if (window.innerWidth < 700) {
  //     titleSize = "36px"
  //     textSize = "20px"
  //     width = "100%"
  //     padding = 10
  //     marginSides = "10px"
  //     paddingVertical = "5px"
  // }

  return (
    <div id="swap">
      <div id="content"></div>
      {/* <img id="image-eth" src={`${mediaPath}ethereum.svg`} alt="Ethereum" /> */}

      <div id="footer">
        <div id="footer-text-2">Austin, TX</div>
      </div>
    </div>
  );
}
