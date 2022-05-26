import { gql, useQuery } from '@apollo/client'
import { MoreHorizontal } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const GET_REGISTRATIONS = gql`
  query GetRegistrations($id: String!) {
    account(id: $id) {
      id
      registrations {
        id
        labelName
      }
    }
  }
`

function Manage() {
  const { t } = useTranslation()
  const { data: account } = useAccount()

  const { data } = useQuery(GET_REGISTRATIONS, {
    variables: { id: account?.address?.toLowerCase() },
    skip: !account?.address,
  })

  return (
    <div>
      <h1>Manage</h1>
      {data?.account?.registrations?.map((registration: any) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          key={registration.id}
        >
          <p>{registration.labelName}.eth</p>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <MoreHorizontal />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content style={{ backgroundColor: 'white' }}>
              <DropdownMenu.Item>{t(`setAsPrimary`)}</DropdownMenu.Item>
              <DropdownMenu.Item>{t(`renounceOwnership`)}</DropdownMenu.Item>
              <DropdownMenu.Arrow />
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      ))}

      <h2>NFT Avatar</h2>
      <p>TODO:</p>
    </div>
  )
}

export default Manage
