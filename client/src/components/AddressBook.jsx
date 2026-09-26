import { useState } from 'react'
import toast from 'react-hot-toast'
import { addressService } from '../api/services'
import { useAuth } from '../hooks/useAuth'
import Button from './Button'
import Input from './Input'

export default function AddressBook({ addresses, onChange }) {
  const [editing, setEditing] = useState(null)
  const [pending, setPending] = useState(false)
  const [deleting, setDeleting] = useState('')
  const { refreshUser } = useAuth()
  const act = async (operation, message) => {
    setPending(true)
    try {
      await operation()
      await onChange()
      await refreshUser()
      setEditing(null)
      setDeleting('')
      toast.success(message, { id: 'address' })
    } catch (error) { toast.error(error.message, { id: 'address' }) }
    finally { setPending(false) }
  }
  const save = (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    data.isDefault = Boolean(editing.isDefault) || data.isDefault === 'on' || addresses.length === 0
    act(() => editing._id ? addressService.update(editing._id, data) : addressService.create(data), 'Delivery address saved')
  }
  return <div className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold text-brand-ink">Saved addresses</h2><Button variant="outline" disabled={pending} onClick={() => setEditing({})}>Add address</Button></div>
    {editing && <form key={editing._id || 'new'} onSubmit={save} className="mt-5 grid gap-4 rounded-xl bg-brand-mist p-4 sm:grid-cols-2">
      <Input label="Full name" name="fullName" defaultValue={editing.fullName || ''} minLength={2} maxLength={60} autoComplete="name" required />
      <Input label="Contact number" name="phone" defaultValue={editing.phone || ''} type="tel" autoComplete="tel" pattern="[6-9][0-9]{9}" maxLength={10} required />
      <div className="sm:col-span-2"><Input label="House / flat, street and area" name="addressLine1" defaultValue={editing.addressLine1 || ''} autoComplete="address-line1" required /></div>
      <Input label="Address line 2 (optional)" name="addressLine2" defaultValue={editing.addressLine2 || ''} autoComplete="address-line2" />
      <Input label="Landmark (optional)" name="landmark" defaultValue={editing.landmark || ''} />
      <Input label="City" name="city" defaultValue={editing.city || ''} autoComplete="address-level2" required />
      <Input label="State" name="state" defaultValue={editing.state || ''} autoComplete="address-level1" required />
      <Input label="PIN code" name="postalCode" defaultValue={editing.postalCode || ''} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="postal-code" required />
      <Input as="select" label="Address type" name="addressType" defaultValue={editing.addressType || 'home'}><option value="home">Home</option><option value="work">Work</option><option value="other">Other</option></Input>
      <label className="flex items-center gap-2 text-sm sm:col-span-2"><input name="isDefault" type="checkbox" disabled={editing.isDefault} defaultChecked={editing.isDefault || addresses.length === 0} />Use as my default delivery address and account details</label>
      <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save address'}</Button><Button variant="ghost" disabled={pending} onClick={() => setEditing(null)}>Cancel</Button>
    </form>}
    <div className="mt-4 grid gap-3">
      {addresses.length === 0 && !editing && <p className="rounded-xl bg-brand-mist p-4 text-sm leading-6 text-slate-500">Add your first delivery address. Your name and contact number will appear in your profile automatically.</p>}
      {addresses.map((address) => <div key={address._id} className="rounded-xl border border-slate-100 p-4 text-sm leading-6 text-slate-600">
        <div className="flex justify-between gap-2"><p className="font-bold text-brand-ink">{address.fullName}</p>{address.isDefault && <span className="rounded-full bg-green-50 px-3 text-xs font-semibold text-green-700">Default</span>}</div>
        <p>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p><p>{address.city}, {address.state} – {address.postalCode}</p><p>{address.phone}</p>
        <div className="mt-3 flex flex-wrap gap-4 font-semibold"><button disabled={pending} onClick={() => setEditing(address)} className="text-brand-blue">Edit</button>{!address.isDefault && <button disabled={pending} onClick={() => act(() => addressService.setDefault(address._id), 'Default address updated')} className="text-brand-blue">Make default</button>}<button disabled={pending} onClick={() => setDeleting(address._id)} className="text-red-600">Remove</button></div>
        {deleting === address._id && <div className="mt-3 rounded-lg bg-red-50 p-3"><p>Remove this saved address?</p><div className="mt-2 flex gap-4 font-semibold"><button disabled={pending} onClick={() => act(() => addressService.remove(address._id), 'Address removed')}>Yes, remove</button><button disabled={pending} onClick={() => setDeleting('')}>Keep address</button></div></div>}
      </div>)}
    </div>
  </div>
}
