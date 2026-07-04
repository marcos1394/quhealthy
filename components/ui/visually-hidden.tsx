import * as React from "react";

export const VisuallyHidden = ({ children }: { children: React.ReactNode }) => {
 return (
 <span className="sr-only">
 {children}
 </span>
 );
};