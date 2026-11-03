import {
  apiBase,
  cancelCall,
  deleteCall,
  deleteParamsCall,
  getCall,
  postCall,
  postFormDataCall,
  putCall,
  putFormDataCall,
} from "@/constants";
import { commonService } from "@/services/common.service";

const getAPICall = async (apiName: string, value: any = ""): Promise<any> => {
  if (commonService.getAPIFlag(apiName)) {
    return await cancelCall();
  } else {
    commonService.resetAPIFlag(apiName, true);
    return await getCall(apiBase[apiName] + value);
  }
};

const postAPICall = async (apiName: string, value: any): Promise<any> => {
  if (commonService.getAPIFlag(apiName)) {
    return await cancelCall();
  } else {
    commonService.resetAPIFlag(apiName, true);
    return await postCall(apiBase[apiName], JSON.stringify(value));
  }
};

const postFormDataAPICall = async (apiName: string, value: any): Promise<any> => {
  if (commonService.getAPIFlag(apiName)) {
    return await cancelCall();
  } else {
    commonService.resetAPIFlag(apiName, true);
    return await postFormDataCall(apiBase[apiName], value);
  }
};

const putFormDataAPICall = async (apiName: string, value: any): Promise<any> => {
  if (commonService.getAPIFlag(apiName)) {
    return await cancelCall();
  } else {
    commonService.resetAPIFlag(apiName, true);
    return await putFormDataCall(apiBase[apiName], value);
  }
};

const deleteAPICall = async (apiName: string, value: any): Promise<any> => {
  if (commonService.getAPIFlag(apiName)) {
    return await cancelCall();
  } else {
    commonService.resetAPIFlag(apiName, true);
    return await deleteCall(apiBase[apiName], JSON.stringify(value));
  }
};

const deleteParamsAPICall = async (apiName: string, value: any = ""): Promise<any> => {
  if (commonService.getAPIFlag(apiName)) {
    return await cancelCall();
  } else {
    commonService.resetAPIFlag(apiName, true);
    return await deleteParamsCall(apiBase[apiName] + value);
  }
};

const putAPICall = async (apiName: string, value: any): Promise<any> => {
  if (commonService.getAPIFlag(apiName)) {
    return await cancelCall();
  } else {
    commonService.resetAPIFlag(apiName, true);
    return await putCall(apiBase[apiName], JSON.stringify(value));
  }
};

export const apiService = {
  GetAPICall: getAPICall,
  PostAPICall: postAPICall,
  PostFormDataAPICall: postFormDataAPICall,
  PutFormDataAPICall: putFormDataAPICall,
  DeleteAPICall: deleteAPICall,
  DeleteParamsAPICall: deleteParamsAPICall,
  PutAPICall: putAPICall,
};
