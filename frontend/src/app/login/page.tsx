'use client'

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/expenses')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) return <Spinner />
  if (isAuthenticated) return null

  return <AuthLayout form={<LoginForm />} />;
}
