import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

function fixEncoding(badString: string): string {
  try {
    const bytes = new Uint8Array(badString.length);
    for (let i = 0; i < badString.length; i++) {
      bytes[i] = badString.charCodeAt(i); 
    }
    return new TextDecoder('utf-8').decode(bytes); 
  } catch (e) {
    return badString;
  }
}

function deepFixEncoding(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  if (typeof data === 'string') {
    return fixEncoding(data);
  }
  if (Array.isArray(data)) {
    return data.map(deepFixEncoding);
  }
  if (typeof data === 'object') {
    const fixedObject: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        fixedObject[key] = deepFixEncoding(data[key]);
      }
    }
    return fixedObject;
  }
  return data;
}

export function fixResponseEncodingPipe(): OperatorFunction<any, any> {
  return map(response => {
    return deepFixEncoding(response);
  });
}