import { useQuery } from '@apollo/client'
import { Award, Image, MoreHorizontal, Plus, Trash } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useAccount, useContractWrite, useEnsName } from 'wagmi'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { formatDistanceToNow } from 'date-fns'

import IconButton from 'components/IconButton'
import Loader from 'components/Loader'

import { contractConfig } from 'utils/contracts/ens-controller'

import { AvatarImg, DomainItem, DropDownItem, MenuContent } from './styled'
import GET_REGISTRATIONS from './getRegistrations.gql'

function Manage() {
  const { t } = useTranslation()

  const { data: account } = useAccount()
  const { data: name, refetch } = useEnsName({ address: account?.address })

  const { data } = useQuery(GET_REGISTRATIONS, {
    variables: { id: account?.address?.toLowerCase() },
    skip: !account?.address,
  })

  const { write, isLoading } = useContractWrite(contractConfig, 'setName')

  function handleSetPrimary({ labelName }: any) {
    write({ args: [`${labelName}.eth`] })
    refetch()
  }

  function handleSetAvatar({ labelName }: any) {
    return labelName
  }

  return (
    <>
      <h2>{t(`manage`)}</h2>
      {data?.account?.registrations?.map((registration: any) => (
        <DomainItem key={registration.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AvatarImg src="" alt="" />
            <div>
              <p style={{ fontSize: '1.1rem' }}>
                <b>{registration.labelName}.eth</b>
                {name === `${registration.labelName}.eth` && (
                  <span> ({t(`primary`)})</span>
                )}
              </p>
              {registration.expiryDate && (
                <p style={{ fontSize: '0.9rem', opacity: 0.5, marginTop: 2 }}>
                  Expires in{' '}
                  {formatDistanceToNow(
                    new Date(Number(registration.expiryDate + '000')),
                  )}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu.Root>
            <IconButton as={DropdownMenu.Trigger}>
              {isLoading ? <Loader /> : <MoreHorizontal />}
            </IconButton>
            <MenuContent>
              <DropDownItem onSelect={() => handleSetPrimary(registration)}>
                <Award size={14} strokeWidth={3} />
                {t(`setAsPrimary`)}
              </DropDownItem>
              <DropDownItem onSelect={() => handleSetAvatar(registration)}>
                <Image size={14} strokeWidth={3} />
                {t(`setNFTAvatar`)}
              </DropDownItem>
              <DropDownItem disabled>
                <Plus size={14} strokeWidth={3} />
                {t(`addRecords`)}
              </DropDownItem>
              <DropDownItem disabled>
                <Trash size={14} strokeWidth={3} />
                {t(`renounceOwnership`)}
              </DropDownItem>
              <DropdownMenu.Arrow />
            </MenuContent>
          </DropdownMenu.Root>
        </DomainItem>
      ))}
    </>
  )
}

export default Manage
