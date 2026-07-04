/* eslint-disable react-doctor/no-react19-deprecated-apis */
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

export const AccordionTrigger = React.forwardRef<
 React.ElementRef<typeof AccordionPrimitive.Trigger>,
 React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className = "", children, ...props }, ref) => (
 <AccordionPrimitive.Header className="flex">
 <AccordionPrimitive.Trigger
 ref={ref}
 className={cn(
 "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
 className
 )}
 {...props}
 >
 {children}
 </AccordionPrimitive.Trigger>
 </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

