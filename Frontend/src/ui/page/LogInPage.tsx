import { SignIn } from "@clerk/clerk-react"

function LogInPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn/>
    </div>
  )
}

export default LogInPage