import { Redirect, Slot, useGlobalSearchParams, type Href } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
    const { isSignedIn } = useAuth()
    const { returnTo } = useGlobalSearchParams<{ returnTo?: string }>()

    if (isSignedIn) {
      return <Redirect href={(returnTo as Href) ?? '/'} />;
    }

    return <Slot />
}
