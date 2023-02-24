import { Trans } from '@lingui/macro'
import { ReactComponent as DotLine } from 'assets/svg/dot_line.svg'
import Row from 'components/Row'
import { useChainTokenMapContext } from 'hooks/useTokenList'
import { NATIVE_ADDRESS } from 'hooks/useTokenList/utils'
import { ChevronRight, HelpCircle } from 'icons'
import React, { ComponentProps, forwardRef, useState } from 'react'
import styled from 'styled-components/macro'
import { Layer, ThemedText } from 'theme'
import { Body2LineHeightRem } from 'theme/type'
import { Step, ZERO_ADDRESS } from 'wido'

import { IconButton } from './Button'
import Popover from './Popover'
import TokenImg from './TokenImg'
import { useTooltip } from './Tooltip'

export const RouteSummary = styled(ThemedText.Body2)`
  align-items: center;
  color: ${({ theme, color }) => color ?? theme.primary};
  display: flex;
`

export const ForwardedRow = forwardRef<HTMLDivElement, ComponentProps<typeof Row>>(function ForwardedRow(props, ref) {
  return <Row ref={ref} {...props} />
})

const RouteNode = styled(Row)`
  background-color: ${({ theme }) => theme.interactive};
  border-radius: ${({ theme }) => `${(theme.borderRadius.medium ?? 1) * 0.5}em`};
  margin: 0 1em;
  padding: 0.25em 0.375em;
  width: max-content;
`
// const RouteBadge = styled.div`
//   background-color: ${({ theme }) => theme.module};
//   border-radius: ${({ theme }) => `${(theme.borderRadius.medium ?? 1) * 0.25}em`};
//   padding: 0.125em;
// `

const Dots = styled(DotLine)`
  color: ${({ theme }) => theme.outline};
  position: absolute;
  z-index: ${Layer.UNDERLAYER};
`

const ExpandButton = styled(IconButton)`
  margin-left: 0.5em;
`

const CONTAINER_VERTICAL_PADDING_EM = 1
export const ORDER_ROUTING_HEIGHT_EM = CONTAINER_VERTICAL_PADDING_EM * 2 + Body2LineHeightRem /* Body2 line height */

const OrderRoutingRow = styled(Row)`
  height: ${ORDER_ROUTING_HEIGHT_EM}em;
  margin: 0 1em;
  padding: ${CONTAINER_VERTICAL_PADDING_EM}em 0;
`

export function getToken(chainTokenMap: any, chainId: any, address: any) {
  const actualAddress = address === ZERO_ADDRESS ? NATIVE_ADDRESS : address
  return chainTokenMap[chainId][actualAddress].token
}

export function RouteBreakdown(props: { steps: Step[] }) {
  const { steps } = props

  const chainTokenMap = useChainTokenMapContext()
  const [tooltip, setTooltip] = useState<HTMLDivElement | null>(null)
  const showTooltip = useTooltip(tooltip)

  return (
    <OrderRoutingRow flex>
      <ThemedText.Body2 color="secondary">
        <Trans>Route preview</Trans>
      </ThemedText.Body2>
      <Popover
        content={
          <Row align="center" style={{ position: 'relative' }}>
            {steps.map((step, index) => {
              return (
                <React.Fragment key={index}>
                  {index === 0 && <TokenImg size={2} token={getToken(chainTokenMap, step.chainId, step.fromToken)} />}
                  <Dots />
                  <RouteNode>
                    <Row gap={0.375}>
                      <ThemedText.Caption>{step.protocol}</ThemedText.Caption>
                      {/* <RouteBadge>
                        <ThemedText.Badge color="secondary">{step.functionName}</ThemedText.Badge>
                      </RouteBadge> */}
                    </Row>
                  </RouteNode>
                  <TokenImg size={2} token={getToken(chainTokenMap, step.toChainId, step.toToken)} />
                </React.Fragment>
              )
            })}
          </Row>
        }
        show={showTooltip}
        placement="bottom"
      >
        <ForwardedRow ref={setTooltip}>
          <RouteSummary>
            {steps.map((step, index) => {
              return (
                <React.Fragment key={index}>
                  {index === 0 && getToken(chainTokenMap, step.chainId, step.fromToken).symbol}
                  <ChevronRight />
                  {getToken(chainTokenMap, step.toChainId, step.toToken).symbol}
                </React.Fragment>
              )
            })}
            {/* <ExpandButton
                  color="secondary"
                  icon={expanded ? Minimize : Maximize}
                  iconProps={{}}
                /> */}
            <ExpandButton color="secondary" icon={HelpCircle} iconProps={{}} />
          </RouteSummary>
        </ForwardedRow>
      </Popover>
    </OrderRoutingRow>
  )
}
