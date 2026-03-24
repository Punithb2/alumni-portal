import { Suspense } from 'react'

const FallbackSpinner = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[200px]">
    <div className="w-8 h-8 border-4 border-indigo-200 border-t-sky-500 rounded-full animate-spin" />
  </div>
)

// eslint-disable-next-line no-unused-vars
const Loadable = (Component) => (props) => (
  <Suspense fallback={<FallbackSpinner />}>
    <Component {...props} />
  </Suspense>
)

export default Loadable
