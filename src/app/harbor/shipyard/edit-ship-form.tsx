import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import EditShipForm from './EditShipForm'
import { Ship } from '@/app/utils/data' // Adjust the import if needed
import { useToast } from '@/hooks/use-toast'

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn(),
  }),
}))

// Mock the deleteShip function
jest.mock('./ship-utils', () => ({
  deleteShip: jest.fn(),
  updateShip: jest.fn(),
}))

describe('EditShipForm', () => {
  const mockCloseForm = jest.fn()
  const mockSetShips = jest.fn()

  const ship: Ship = {
    id: '1',
    title: 'Test Ship',
    updateDescription: '',
    repoUrl: '',
    deploymentUrl: '',
    readmeUrl: '',
    screenshotUrl: '',
    shipType: 'update', // or 'original' based on your needs
  }

  beforeEach(() => {
    mockCloseForm.mockClear()
    mockSetShips.mockClear()
  })

  test('shows delete confirmation when the delete button is clicked', async () => {
    // Mock window.confirm to simulate user interaction
    window.confirm = jest.fn().mockReturnValue(true) // Simulate user clicking 'OK'

    render(
      <EditShipForm
        ship={ship}
        closeForm={mockCloseForm}
        setShips={mockSetShips}
      />
    )

    const deleteButton = screen.getByText(/Delete Ship/)
    fireEvent.click(deleteButton)

    // Check that the delete confirmation was triggered
    expect(window.confirm).toHaveBeenCalledWith(
      `Are you sure you want to delete "${ship.title}"? This action cannot be undone.`
    )

    // Simulate the deletion logic
    await waitFor(() => expect(mockSetShips).toHaveBeenCalled())
    await waitFor(() => expect(mockCloseForm).toHaveBeenCalled())
  })

  test('does not delete ship when canceling confirmation', async () => {
    // Simulate user canceling the confirmation
    window.confirm = jest.fn().mockReturnValue(false)

    render(
      <EditShipForm
        ship={ship}
        closeForm={mockCloseForm}
        setShips={mockSetShips}
      />
    )

    const deleteButton = screen.getByText(/Delete Ship/)
    fireEvent.click(deleteButton)

    // Check that window.confirm was called
    expect(window.confirm).toHaveBeenCalledWith(
      `Are you sure you want to delete "${ship.title}"? This action cannot be undone.`
    )

    // Verify that deleteShip wasn't called and the ship is not deleted
    await waitFor(() => expect(mockSetShips).not.toHaveBeenCalled())
    await waitFor(() => expect(mockCloseForm).not.toHaveBeenCalled())
  })
})
