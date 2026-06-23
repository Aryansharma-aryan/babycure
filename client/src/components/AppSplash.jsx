import logo from '../assets/logoBaby.png'

export default function AppSplash() {
  return (
    <div className="baby-splash fixed inset-0 z-[999] h-dvh w-screen bg-white">
      <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 px-4 text-center">
        <div className="mx-auto h-36 w-64 max-w-[78vw] sm:h-44 sm:w-80">
          <img src={logo} alt="Babycure" className="h-full w-full object-contain" />
        </div>
      </div>
    </div>
  )
}
