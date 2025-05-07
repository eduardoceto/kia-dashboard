"use client"

import { useState } from 'react'
import { login } from '../actions'
import Image from "next/image"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const result = await login(email, password)
            if (result.success) {
                toast.success('Inicio de sesión exitoso')
                router.push(`/${result.locale}/dashboard`)
            } else {
                toast.error('Usuario o contraseña incorrectos')
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error('Error al iniciar sesión')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            {isLoading ? (
                <div className="flex flex-col items-center space-y-4 text-[#05141F]">
                    <Loader2 className="h-12 w-12 animate-spin" />
                    <p className="text-lg font-medium">Iniciando sesión...</p>
                    <p className="text-sm text-muted-foreground">Por favor espera un momento.</p>
                </div>
            ) : (
                <div className="w-full max-w-md flex flex-col items-center">
                    <div className="mb-8">
                        <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b6/KIA_logo3.svg" alt="KIA Logo" width={150} height={50} priority className="flex-shrink-0 block"/>
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
                            className="w-full rounded-b-sm h-12 px-4 bg-accent-foreground/60 focus:bg-tertiarty/20 transition-colors duration-400"
                            required
                            disabled={isLoading}
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
                            className="w-full rounded-b-sm h-12 px-4 bg-accent-foreground/60  focus:bg-tertiarty/20 transition-colors duration-400"
                            required
                            disabled={isLoading}
                        />
                        </div>
                        <div className="pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-card text-[#05141F] rounded-b-sm border border-#05141F hover:bg-[#1f2c35] hover:text-white transition-colors duration-500 h-12 font-medium"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#05141F]" />
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
