import { useState } from 'react'
import toast from 'react-hot-toast'
import { contactService } from '../api/services'
import Button from './Button'
import Input from './Input'

export default function AccountFeedback({ user, labels }) {
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setPending(true)
    try {
      await contactService.create({ name: data.name.trim(), email: data.email.trim(), phone: data.phone.trim(), message: `[Website feedback | Rating: ${data.rating}/5]\n${data.message.trim()}` })
      setSent(true)
      toast.success(labels.feedbackSent, { id: 'account-feedback' })
    } catch (error) { toast.error(error.message) }
    finally { setPending(false) }
  }
  if (sent) return <div role="status" className="rounded-xl bg-green-50 p-5 text-sm text-green-800"><p>{labels.feedbackSent}</p><button type="button" onClick={() => setSent(false)} className="mt-3 font-bold underline">{labels.moreFeedback}</button></div>
  return <form onSubmit={submit} className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
    <p className="text-sm leading-6 text-slate-500 sm:col-span-2">{labels.feedbackCopy}</p>
    <Input label={labels.name} name="name" defaultValue={user?.name || ''} autoComplete="name" maxLength={80} required />
    <Input label={labels.email} name="email" type="email" defaultValue={user?.email || ''} autoComplete="email" required />
    <Input label={labels.phone} name="phone" type="tel" defaultValue={user?.phone || ''} autoComplete="tel" pattern="[6-9][0-9]{9}" maxLength={10} required />
    <Input as="select" label={labels.rating} name="rating" defaultValue="5">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</Input>
    <div className="sm:col-span-2"><Input as="textarea" label={labels.message} name="message" rows={4} minLength={5} maxLength={850} required /></div>
    <Button type="submit" disabled={pending} className="sm:col-span-2">{pending ? labels.sending : labels.sendFeedback}</Button>
  </form>
}
