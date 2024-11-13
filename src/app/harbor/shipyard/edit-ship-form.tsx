import { Button, buttonVariants } from '@/components/ui/button'
import { deleteShip, updateShip } from './ship-utils'
import type { Ship } from '@/app/utils/data'
import { useToast } from '@/hooks/use-toast'
import Icon from '@hackclub/icons'
import { useState } from 'react'

const editMessages = [
  'Orpheus hopes you know that she put a lot of effort into recording your changes~',
  'Heidi scribbles down your changes hastily...',
  "Orpheus put your Ship changes in the logbook. They're going nowhere, rest assured.",
]

const deleteMessages = [
  'is no more!',
  'has been struck from the logbook',
  'has been lost to time...',
]

export default function EditShipForm({
  ship,
  closeForm,
  setShips,
}: {
  ship: Ship
  closeForm: () => void
  setShips: any
}) {
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  const { toast } = useToast()

  const handleSubmit = async (e) => {
    setSaving(true)
    e.preventDefault()
    const formData = new FormData(e.target)
    const formValues = Object.fromEntries(formData.entries())

    const newShip: Ship = {
      ...ship,
      title: formValues.title as string,
      ...(formValues.update_description && {
        updateDescription: formValues.update_description as string,
      }),
      repoUrl: formValues.repoUrl as string,
      deploymentUrl: formValues.deploymentUrl as string,
      readmeUrl: formValues.readmeUrl as string,
      screenshotUrl: formValues.screenshotUrl as string,
    }
    console.log('updating...', formValues, ship, newShip)
    await updateShip(newShip)

    if (setShips) {
      console.log('Set ships is passed! Updating ship with ID', newShip.id)

      setShips((previousShips: Ship[]) => {
        console.log('the previous ships were', previousShips)
        const newShips = previousShips.map((s: Ship) =>
          s.id === newShip.id ? newShip : s,
        )

        setSaving(false)
        return newShips
      })
    } else {
      console.error("Updated a ship but can't setShips bc you didn't pass it.")
    }
    closeForm()

    toast({
      title: 'Ship updated!',
      description:
        editMessages[Math.floor(Math.random() * editMessages.length)],
    })

    setSaving(false)
  }

  const handleDelete = async (e) => {
    setDeleting(true)

    e.preventDefault()

    // Add delete confirmation dialog
    const confirmation = window.confirm(`Are you sure you want to delete "${ship.title}"? This action cannot be undone.`)

    if (!confirmation) {
      setDeleting(false)
      return
    }

    console.log('trying to delete ', ship.id, ship.title)
    await deleteShip(ship.id)

    if (setShips) {
      console.log(`Deleted ${ship.title} (${ship.id})`)

      setShips((previousShips: Ship[]) =>
        previousShips.filter((s: Ship) => s.id !== ship.id),
      )
    } else {
      console.error("Deleted a ship but can't setShips bc you didn't pass it.")
    }
    closeForm()

    toast({
      title: 'Ship deleted!',
      description: `${ship.shipType === 'update' ? 'Your update to ' : ''}${
        ship.title
      } ${deleteMessages[Math.floor(Math.random() * deleteMessages.length)]}`,
    })

    setDeleting(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2"
      id="selected-ship-edit-form"
    >
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          defaultValue={ship.title}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {ship.updateDescription && (
        <div>
          <label htmlFor="reshippedFromId">Update description</label>
          <input
            id="update_description"
            name="update_description"
            defaultValue={ship.updateDescription}
            required
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      <div>
        <label htmlFor="repoUrl">Repo URL</label>
        <input
          id="repoUrl"
          name="repoUrl"
          defaultValue={ship.repoUrl}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="deploymentUrl">Demo Link (Project / Video URL)</label>
        <input
          id="deploymentUrl"
          name="deploymentUrl"
          defaultValue={ship.deploymentUrl}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="readmeUrl">README URL</label>
        <input
          id="readmeUrl"
          name="readmeUrl"
          defaultValue={ship.readmeUrl}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="screenshotUrl">Screenshot URL</label>
        <input
          id="screenshotUrl"
          name="screenshotUrl"
          defaultValue={ship.screenshotUrl}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex justify-between">
        <Button
          id="submit"
          className={buttonVariants({ variant: 'default' })}
          type="submit"
          disabled={saving}
        >
          {saving ? <Icon glyph="more" /> : <Icon glyph="thumbsup-fill" />}
          Save edits
        </Button>

        <Button
          className={`${buttonVariants({ variant: 'destructive' })} ml-auto`}
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? <Icon glyph="more" /> : <Icon glyph="forbidden" />}
          Delete Ship
        </Button>
      </div>
    </form>
  )
}
