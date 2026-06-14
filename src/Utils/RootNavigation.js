// RootNavigation.js

import * as React from "react";

export const navigationRef = React.createRef();

export function navigate(name, params) {
  if (navigationRef?.current?.navigate) {
    navigationRef.current.navigate(name, params);
  }
}
export function push(name, params) {
  if (navigationRef?.current?.navigate) {
    navigationRef.current.push(name, params);
  }
}
export function pop() {
  if (navigationRef?.current?.goBack) {
    navigationRef.current.goBack();
  }
}
export function popToTop() 
{    
  if (navigationRef?.current?.navigate) {
    navigationRef.current.navigate.popToTop();
  }
}
// add other navigation functions that you need and export them
