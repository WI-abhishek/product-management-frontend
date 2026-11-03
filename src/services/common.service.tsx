import { commonUtils, undefinedAndNullChecker } from "@/constants";

const formBody = (details: any) => {
  const formBodyData = [];
  for (const property in details) {
    if (details.hasOwnProperty(property)) {
      formBodyData.push(encodeURIComponent(property) + "=" + encodeURIComponent(details[property]));
    }
  }
  return formBodyData.join("&");
};

const getAPIFlag = (flagType: string) => {
  const flag = commonUtils.getFlag(flagType);
  if (undefinedAndNullChecker(flagType)) {
    return flag;
  } else {
    return false;
  }
};

const resetAPIFlag = (flagType: string, flag: boolean) => {
  commonUtils.setFlag(flagType, flag);
};

const convertJsonToQueryString = (url: string, data: object) => {
  return url + "?" + formBody(data);
};

export const commonService = {
  getAPIFlag,
  resetAPIFlag,
  convertJsonToQueryString,
  formBody,
};
