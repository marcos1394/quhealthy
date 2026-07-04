"use client"
/* eslint-disable react-doctor/no-react19-deprecated-apis */;;

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const TabsContent = React.forwardRef<
 React.ElementRef<typeof TabsPrimitive.Content>,
 React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className = "", ...props }, ref) => (
 <TabsPrimitive.Content
 ref={ref}
 className={cn(
 "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
 className
 )}
 {...props}
 />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

