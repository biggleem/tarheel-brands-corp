'use client'

import { useState, useCallback } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Landmark, Loader2 } from 'lucide-react'

interface PlaidLinkButtonProps {
  orgId: string
  onSuccess?: () => void
}

export function PlaidLinkButton({ orgId, onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const createLinkToken = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId }),
      })
      const data = await res.json()
      if (data.link_token) {
        setLinkToken(data.link_token)
      }
    } catch (error) {
      console.error('Failed to create link token:', error)
    }
    setLoading(false)
  }

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      try {
        await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_token: publicToken,
            org_id: orgId,
            metadata,
          }),
        })
        onSuccess?.()
      } catch (error) {
        console.error('Failed to exchange token:', error)
      }
    },
    [orgId, onSuccess]
  )

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
  })

  if (!linkToken) {
    return (
      <button
        onClick={createLinkToken}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Landmark className="w-4 h-4" />
        )}
        Connect Bank Account
      </button>
    )
  }

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
    >
      <Landmark className="w-4 h-4" />
      Open Plaid Link
    </button>
  )
}
