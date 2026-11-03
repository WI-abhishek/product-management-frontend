import apiFlagData from "@/constants/api-flag.constants.json";
import smallLogoImage from "/images/small-logo.png";
import mainLogoImage from "/images/main-logo.png";
import loginBackground from "/images/background.jpg";
import noDataImage from "/images/no-data-found.webp";
import faviconImage from "/images/favicon.png";

const getFlag = (label: string) => {
  const flagArray: any = apiFlagData;

  return flagArray[label];
};

const setFlag = (label: string, flag: boolean) => {
  const flagArray: any = apiFlagData;
  flagArray[label] = flag;
};

export const commonUtils = {
  getFlag,
  setFlag,
  smallLogoImage,
  mainLogoImage,
  loginBackground,
  noDataImage,
  faviconImage,
};
