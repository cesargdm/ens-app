import { useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { Award, Image, MoreHorizontal, Plus, Trash } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useAccount, useContractWrite, useEnsName, useNetwork } from 'wagmi'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import namehash from '@ensdomains/eth-ens-namehash'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import * as AspectRatio from '@radix-ui/react-aspect-ratio'
import * as Dialog from '@radix-ui/react-dialog'
import styled from 'styled-components'

import IconButton from 'components/IconButton'
import Loader from 'components/Loader'
import Button from 'components/Button'

import { contractConfig } from 'utils/contracts/ens-resolver'

import { AvatarImg, DomainItem, DropDownItem, MenuContent } from './styled'
import GET_REGISTRATIONS from './getRegistrations.gql'

const GET_NFTS = gql`
  query GetNFTs($owner: String!) {
    nftResponse(owner: $owner)
      @rest(type: "NftResponse", path: "/getNFTs/?owner={args.owner}") {
      totalCount
      ownedNfts {
        id @type(name: "TokenId") {
          tokenId
          tokenMetadata @type(name: "TokenMetadata") {
            tokenType
          }
        }
        contract @type(name: "Contract") {
          address
        }
        title
        media @type(name: "TokenMedia") {
          gateway
          raw
        }
      }
    }
  }
`

const Overlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
`

const Content = styled(Dialog.Content)`
  background-color: var(--colors--background);
  border-radius: 24px;
  padding: 16px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 500px;
  max-height: 85vh;
  padding: 24px;
`

function getNftAvatarUri(nft: any) {
  return `eip155:1/${nft.id.tokenMetadata.tokenType.toLowerCase()}:${
    nft.contract.address
  }/${parseInt(nft.id.tokenId)}`
}

function NameAvatar({
  name,
  address,
  networkId,
  handleClose,
}: {
  name: string
  networkId: number
  address: string
  handleClose: () => void
}) {
  const { t } = useTranslation()

  const [selectedNft, setSelectedNft] = useState('')

  const { data: nftData, loading: nftDataLoading } = useQuery(GET_NFTS, {
    variables: { owner: address },
  })
  const nfts = nftData?.nftResponse.ownedNfts.filter((nft: any) => nft?.media)

  // Get contract based on networkId and controller
  const { write, isLoading } = useContractWrite(
    contractConfig(networkId),
    'setText',
  )

  function handleSelect(nft: any) {
    const avatarUri = getNftAvatarUri(nft)

    setSelectedNft(avatarUri)
  }

  function handleConfirm() {
    // TODO: CHECK if current name resolver supports setting this record
    write({ args: [namehash.hash(`${name}.eth`), 'avatar', selectedNft] })
  }

  return (
    <>
      <Dialog.Root
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose()
        }}
        defaultOpen
      >
        <Dialog.Portal>
          <Overlay />
          <Content>
            <Dialog.Title>Select NFT for {`${name}.eth`}</Dialog.Title>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr)',
                alignItems: 'start',
                gap: 16,
                marginTop: 16,
              }}
            >
              {nfts?.length > 0 ? (
                nfts.map((nft: any) => (
                  <button
                    onClick={() => handleSelect(nft)}
                    style={{
                      width: '100%',
                      minWidth: 0,
                      padding: 0,
                      opacity: selectedNft
                        ? getNftAvatarUri(nft) === selectedNft
                          ? 1
                          : // eslint-disable-next-line no-magic-numbers
                            0.5
                        : 1,
                    }}
                    key={nft.id.tokenId}
                  >
                    <AspectRatio.Root
                      style={{ width: '100%', marginBottom: 8 }}
                    >
                      <img
                        style={{
                          height: '100%',
                          width: '100%',
                          borderRadius: 10,
                          objectFit: 'cover',
                        }}
                        src={nft.media?.[0]?.gateway}
                        alt=""
                      />
                    </AspectRatio.Root>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                      <b>{nft.title}</b>
                    </p>
                  </button>
                ))
              ) : nftDataLoading ? (
                <p>Loading</p>
              ) : (
                <p>{t(`noNftsFound`)}</p>
              )}
            </div>

            <Button
              disabled={!selectedNft || isLoading}
              onClick={handleConfirm}
              pulse={isLoading}
            >
              {t(`confirm`)}
            </Button>

            <p style={{ textAlign: 'center', marginTop: 16, opacity: 0.5 }}>
              Data provided by Alchemi, may be outdated
            </p>

            <Dialog.Close>Close</Dialog.Close>
          </Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

function Manage() {
  const { t } = useTranslation()

  const { data: account } = useAccount()
  const { activeChain } = useNetwork()
  const { data: name, refetch } = useEnsName({ address: account?.address })

  const [selectedName, setSelectedName] = useState<string>('')

  const { data } = useQuery(GET_REGISTRATIONS, {
    variables: { id: account?.address?.toLowerCase() },
    skip: !account?.address,
  })

  const { write, isLoading } = useContractWrite(
    contractConfig(activeChain?.id),
    'setName',
  )

  function handleSetPrimary({ labelName }: any) {
    write({ args: [`${labelName}.eth`] })
    refetch()
  }

  function handleSetAvatar({ labelName }: any) {
    setSelectedName(labelName)
  }

  return (
    <>
      {account?.address && selectedName && activeChain?.id && (
        <NameAvatar
          handleClose={() => setSelectedName('')}
          address={account.address}
          networkId={activeChain?.id}
          name={selectedName}
        />
      )}
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
