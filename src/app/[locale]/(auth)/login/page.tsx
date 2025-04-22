"use client"

import { useState } from 'react'
import { login } from './actions'
import kiaLogo from "@/public/kia-logo-white.svg"


import Image from "next/image"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await login(email, password)
        }
        catch (error) {
            console.error('Error during login:', error)
            toast.error('Usuario o contraseña incorrectos')
        }
        finally {
            setIsLoading(false)
        }
    }


    return (
        <main className="flex min-h-screen flex-col items-center justify-center">
            {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin" /> {/* Optional loading spinner */}
                    <p className="text-lg font-medium">Iniciando sesión...</p>
                    <p className="text-sm text-muted-foreground">Por favor espera un momento.</p>
                </div>
            ) : (
                <div className="w-full max-w-md flex flex-col items-center">
                    <div className="mb-8">
                        <Image src={kiaLogo} alt="KIA Logo" width={150} height={50} priority className="flex-shrink-0 hidden dark:block "/>
                        <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b6/KIA_logo3.svg" alt="KIA Logo" width={150} height={50} priority className="flex-shrink-0 block dark:hidden"/>
                    </div>

                    <form onSubmit={ handleSubmit } className="w-full space-y-6">
                        <div>
                        <Input
                            id='email'
                            name='email'
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-none h-12 px-4"
                            required
                            disabled={isLoading} // Disable input while loading
                        />
                        </div>

                        <div>
                        <Input
                            id='password'
                            name='password'
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-none h-12 px-4"
                            required
                            disabled={isLoading} // Disable input while loading
                        />
                        </div>

                        <div className="pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-none h-12 font-medium"
                            disabled={isLoading} // Disable button while loading
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Iniciando...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </Button>
                        </div>
                    </form>
                </div>
            )}
        </main>
    )
}
