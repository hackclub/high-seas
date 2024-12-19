import { Button, buttonVariants } from '@/components/ui/button'
import { deleteShip, updateShip } from './ship-utils'
import type { Ship } from '@/app/utils/data'
import { useToast } from '@/hooks/use-toast'
import Icon from '@hackclub/icons'
import React, { useState } from 'react'
import Modal from '../../../components/ui/modal'
import { EditableShipFields } from '../../utils/data'

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
  shipChain,
  closeForm,
  setShips,
}: {
  ship: Ship
  shipChain: Ship[]
  closeForm: () => void
  setShips: any
}) {
  const [deleting, setDeleting] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const allowDeletion = ship.shipStatus === 'staged'

  const { toast } = useToast()

  const handleSubmit = async (e) => {
    setSaving(true)
    e.preventDefault()
    const formData = new FormData(e.target)
    const formValues = Object.fromEntries(formData.entries())

    const latestShip = shipChain.at(-1) || ship

    const editableFieldsForLatestShipUpdate: EditableShipFields = {
      title: formValues.title as string,
      repoUrl: formValues.repoUrl as string,
      deploymentUrl: formValues.deploymentUrl as string,
      readmeUrl: formValues.readmeUrl as string,
      screenshotUrl: formValues.screenshotUrl as string,
    }

    // If you're updating a ship WITH a reshippedFromId, updates to the updateDescription should be applied to that ship, not the root ship (AS WELL as the update to the root ship).
    if (ship.reshippedFromId) {
      const theChildShipThatJustHadItsDescriptionUpdated = {
        ...ship,
        updateDescription: formValues.update_description as string,
      }
      await updateShip(theChildShipThatJustHadItsDescriptionUpdated)

      if (setShips) {
        setShips((previousShips: Ship[]) =>
          previousShips.map((s: Ship) =>
            s.id === theChildShipThatJustHadItsDescriptionUpdated.id
              ? theChildShipThatJustHadItsDescriptionUpdated
              : s,
          ),
        )
      }
    }

    const newShip: Ship = {
      ...latestShip,
      ...editableFieldsForLatestShipUpdate,
    }
    // If we're editing the root ship, update the desc with the new one from the form
    if (!ship.reshippedFromId && ship.shipType === 'update') {
      newShip.updateDescription = formValues.update_description as string
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
          maxLength={100}
          required
          className="w-full p-2 rounded bg-white/50"
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
            className="w-full p-2 rounded bg-white/50"
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
          maxLength={160}
          className="w-full p-2 rounded bg-white/50"
        />
      </div>

      <div>
        <label htmlFor="deploymentUrl">Demo Link (Project / Video URL)</label>
        <input
          id="deploymentUrl"
          name="deploymentUrl"
          defaultValue={ship.deploymentUrl}
          maxLength={200}
          required
          className="w-full p-2 rounded bg-white/50"
        />
      </div>

      <div>
        <label htmlFor="readmeUrl">README URL</label>
        <input
          id="readmeUrl"
          name="readmeUrl"
          defaultValue={ship.readmeUrl}
          required
          maxLength={600}
          className="w-full p-2 rounded bg-white/50"
        />
      </div>

      <div>
        <label htmlFor="screenshotUrl">Screenshot URL</label>
        <p className="text-sm text-gray-500">
          No dataurls please. If you need an image host, upload your image in{' '}
          <a href="https://hackclub.slack.com/archives/C016DEDUL87">#cdn</a>
        </p>
        <input
          id="screenshotUrl"
          name="screenshotUrl"
          defaultValue={ship.screenshotUrl}
          required
          maxLength={300}
          className="w-full p-2 rounded bg-white/50"
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

        {allowDeletion && (
          <Button
            className={`${buttonVariants({ variant: 'destructive' })} ml-auto`}
            onClick={(e) => {
              e.preventDefault()
              setOpenDeleteModal(true)
            }}
            disabled={deleting}
          >
            {deleting ? <Icon glyph="more" /> : <Icon glyph="forbidden" />}
            Delete Ship
          </Button>
        )}
      </div>

      <Modal isOpen={openDeleteModal} close={() => setOpenDeleteModal(false)}>
        <div className="flex flex-col gap-3">
          <p className="text-xl">
            Are you sure you want to delete <b>{ship.title}</b>?
          </p>
          <div className="flex gap-1">
            <Button
              onClick={() => setOpenDeleteModal(false)}
              className={`${buttonVariants({ variant: 'outline' })} flex-grow`}
            >
              NNONNO WAIT ヽ(O_O )ﾉ
            </Button>
            <Button
              onClick={handleDelete}
              className={`${buttonVariants({ variant: 'destructive' })}`}
            >
              Yes {'ദ്ദി(｡•̀ ,<)~✩‧₊'}
            </Button>
          </div>
        </div>
      </Modal>
    </form>
  )
}
