"use client";

import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsLayout({
  value,
  onChange,
  sections,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  sections: { value: string; label: string }[];
  children: ReactNode;
}) {
  return (
    <Tabs value={value} onValueChange={onChange} className="min-w-0">
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[176px_minmax(0,1fr)] lg:gap-8">
        <TabsList
          aria-label="Settings sections"
          className="flex h-auto w-full justify-start gap-1 overflow-x-auto lg:flex-col lg:items-stretch"
        >
          {sections.map((section) => (
            <TabsTrigger
              key={section.value}
              value={section.value}
              className="justify-start px-3 py-2"
            >
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={value} className="mt-0 min-w-0">
          {children}
        </TabsContent>
      </div>
    </Tabs>
  );
}
