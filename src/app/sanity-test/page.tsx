"use client";

import { useState, useEffect } from "react";
import { client } from "@/lib/sanity";

const schemas = [
  {
    name: "sample",
    title: "Sample",
    fields: ["title", "category", "slug"],
    displayFields: ["title", "category", "slug"],
  },
  {
    name: "demo",
    title: "Demo",
    fields: ["title", "category", "videoUrl", "slug"],
    displayFields: ["title", "category", "videoUrl", "slug"],
  },
  {
    name: "profile",
    title: "Profile",
    fields: ["name", "role", "email", "phoneNumber"],
    displayFields: ["name", "role", "email", "phoneNumber"],
  },
];

type DocData = Record<string, unknown>;

export default function SchemaTestPage() {
  const [activeTab, setActiveTab] = useState("sample");
  const [data, setData] = useState<DocData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const schema = schemas.find((s) => s.name === activeTab);
        if (!schema) return;
        const result = await client.fetch(
          `*[_type == "${activeTab}"] | order(_createdAt desc) [0..10] {
            ${schema.displayFields.map(f => f === "slug" ? `"slug": slug.current` : f).join(", ")
          }}`
        );
        setData(result || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab]);

  const activeSchema = schemas.find((s) => s.name === activeTab);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-2">Sanity CMS</p>
          <h1 className="text-3xl font-light text-neutral-900 dark:text-neutral-50">Schema Explorer</h1>
        </div>

        <div className="flex gap-1 mb-8 bg-neutral-200/50 dark:bg-neutral-900/50 p-1 rounded-lg w-fit">
          {schemas.map((schema) => (
            <button
              key={schema.name}
              onClick={() => setActiveTab(schema.name)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === schema.name
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
              }`}
            >
              {schema.title}
            </button>
          ))}
        </div>

        <div className="space-y-1 mb-8">
          {activeSchema?.fields.map((field) => (
            <div
              key={field}
              className="flex items-center gap-4 py-3 px-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800"
            >
              <span className="font-mono text-sm text-neutral-900 dark:text-neutral-50 w-32">
                {field}
              </span>
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                string
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Retrieved Data
            </h2>
            <span className="text-xs font-mono text-neutral-400">
              {data.length} document{data.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-neutral-400 text-sm">Fetching...</div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm font-mono">{error}</p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-sm">
              No documents found in {activeSchema?.title}
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((doc, i) => (
                <div
                  key={String(doc._id ?? i)}
                  className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800"
                >
                  {activeSchema?.displayFields.map((field) => {
                    const value = doc[field];
                    const displayValue = 
                      value == null 
                        ? "—" 
                        : typeof value === "object" 
                          ? JSON.stringify(value) 
                          : String(value);
                    
                    return (
                      <div key={field} className="flex gap-4 py-1">
                        <span className="text-xs font-mono text-neutral-400 w-24">{field}</span>
                        <span className="text-sm text-neutral-900 dark:text-neutral-50">
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}