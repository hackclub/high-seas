import Link from 'next/link'
import { Components } from 'react-markdown'

export const markdownComponents: Components = {
  h1: ({ ...props }) => (
    <h1
      className="text-3xl font-bold mb-4 text-indigo-600 dark:text-indigo-300"
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className="text-2xl font-semibold mb-3 text-indigo-500 dark:text-indigo-400"
      {...props}
    />
  ),
  h3: ({ ...props }) => (
    <h3
      className="text-xl font-semibold mb-2 text-indigo-400 dark:text-indigo-500"
      {...props}
    />
  ),
  p: ({ ...props }) => <p className="mb-4" {...props} />,
  a: ({ ...props }) => (
    <Link
      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
      {...props}
    />
  ),
  ul: ({ ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
  ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
  li: ({ ...props }) => <li className="mb-1" {...props} />,
  img: ({ src, alt, ...props }) => (
    <div className="mb-4">
      <img
        src={src}
        alt={alt || ''}
        className="rounded-lg shadow-md"
        {...props}
      />
    </div>
  ),
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '')
    return match ? (
      <pre className="bg-gray-100 dark:bg-gray-700 rounded p-4 overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code
        className="bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5"
        {...props}
      >
        {children}
      </code>
    )
  },
  blockquote: ({ ...props }) => (
    <blockquote
      className="border-l-4 border-indigo-500 pl-4 italic my-4"
      {...props}
    />
  ),
  table: ({ ...props }) => (
    <div className="overflow-x-auto mb-4">
      <table
        className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
        {...props}
      />
    </div>
  ),
  th: ({ ...props }) => (
    <th
      className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
      {...props}
    />
  ),
}
