import { Trans } from '@lingui/macro'
import Expando from 'components/Expando'
import Popover from 'components/Popover'
import { useTooltip } from 'components/Tooltip'
import { DEFAULT_SLIPPAGE_PERCENT, getSlippageWarning, toPercent } from 'hooks/useSlippage'
import { AlertTriangle, Check, Icon, LargeIcon, XOctagon } from 'icons'
import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { forwardRef, memo, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { swapEventHandlersAtom } from 'state/swap'
import { slippageAtom } from 'state/swap/settings'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { BaseButton, TextButton } from '../../Button'
import Column from '../../Column'
import { DecimalInput, inputCss } from '../../Input'
import Row from '../../Row'
import { Label, optionCss } from './components'

const DEFAULT_SLIPPAGE_LABEL = `${DEFAULT_SLIPPAGE_PERCENT.toFixed(0)}%`

const Button = styled(TextButton)<{ selected: boolean }>`
  ${({ selected }) => optionCss(selected)}
`

const Custom = styled(BaseButton)<{ selected: boolean }>`
  ${({ selected }) => optionCss(selected)}
  ${inputCss}
`

const ExpandoContent = styled(Row)`
  margin: 1em 0 0;
`

interface OptionProps {
  wrapper: typeof Button | typeof Custom
  selected: boolean
  onSelect: () => void
  'data-testid': string
  icon?: ReactNode
  tabIndex?: number
  children: ReactNode
}

const Option = forwardRef<HTMLButtonElement, OptionProps>(function Option(
  { wrapper: Wrapper, children, selected, onSelect, icon, tabIndex, 'data-testid': testid }: OptionProps,
  ref
) {
  return (
    <Wrapper selected={selected} onClick={onSelect} ref={ref} tabIndex={tabIndex} data-testid={testid}>
      <Row gap={0.5}>
        {children}
        {icon ? icon : <LargeIcon icon={selected ? Check : undefined} size={1.25} />}
      </Row>
    </Wrapper>
  )
})

const Warning = memo(function Warning({ state, showTooltip }: { state?: 'warning' | 'error'; showTooltip: boolean }) {
  let icon: Icon | undefined
  let content: ReactNode
  let show = showTooltip
  switch (state) {
    case 'error':
      icon = XOctagon
      content = <Trans>Please enter a valid slippage %</Trans>
      show = true
      break
    case 'warning':
      icon = AlertTriangle
      content = <Trans>High slippage increases the risk of price movement</Trans>
      break
  }
  return (
    <Popover
      key={state}
      content={<ThemedText.Caption>{content}</ThemedText.Caption>}
      show={show}
      placement="top"
      offset={16}
      contained
    >
      <LargeIcon icon={icon} color={state} size={1.25} />
    </Popover>
  )
})

export default function MaxSlippageSelect() {
  const { onSlippageChange } = useAtomValue(swapEventHandlersAtom)
  const [slippage, setSlippageBase] = useAtom(slippageAtom)
  const setSlippage = useCallback(
    (update: typeof slippage) => {
      onSlippageChange?.(update)
      setSlippageBase(update)
    },
    [onSlippageChange, setSlippageBase]
  )
  const setDefaultSlippage = useCallback(() => setSlippage({ ...slippage, default: true }), [setSlippage, slippage])
  const [maxSlippageInput, setMaxSlippageInput] = useState(slippage.max?.toString() || '')

  const option = useRef<HTMLButtonElement>(null)
  const showTooltip = useTooltip(option.current)

  const input = useRef<HTMLInputElement>(null)
  const focus = useCallback(() => input.current?.focus(), [input])

  const [warning, setWarning] = useState<'warning' | 'error' | undefined>(getSlippageWarning(toPercent(slippage.max)))
  useEffect(() => {
    setMaxSlippageInput(slippage.max?.toString() || '')
    setWarning(getSlippageWarning(toPercent(slippage.max)))
  }, [slippage.max])

  const onInputSelect = useCallback(() => {
    focus()
    const percent = toPercent(slippage.max)
    const warning = getSlippageWarning(percent)
    const isDefault = !percent || warning === 'error'
    setSlippage({ ...slippage, default: isDefault })
  }, [focus, slippage, setSlippage])

  const processInput = useCallback(
    (max: string | undefined) => {
      setMaxSlippageInput(max || '')
      const percent = toPercent(max)
      const warning = getSlippageWarning(percent)
      const isDefault = !percent || warning === 'error'
      setSlippage({ default: isDefault, max })
    },
    [setSlippage]
  )

  const [open, setOpen] = useState(false)
  return (
    <Column gap={0.75}>
      <Expando
        hideRulers
        showBottomGradient={false}
        title={
          <Row grow>
            <Label
              name={<Trans>Max slippage</Trans>}
              // TODO (tina): clicking on this tooltip on mobile shouldn't open/close expando
              tooltip={
                <Trans>
                  Your transaction will revert if the price changes unfavorably by more than this percentage.
                </Trans>
              }
            />
          </Row>
        }
        iconPrefix={slippage.default ? <Trans>{DEFAULT_SLIPPAGE_LABEL}</Trans> : `${maxSlippageInput}%`}
        maxHeight={5}
        open={open}
        onExpand={() => setOpen(!open)}
      >
        <ExpandoContent gap={0.5} grow="first">
          <Option
            wrapper={Button}
            selected={slippage.default}
            onSelect={setDefaultSlippage}
            data-testid="default-slippage"
          >
            <ThemedText.ButtonMedium>
              <Trans>{DEFAULT_SLIPPAGE_LABEL}</Trans>
            </ThemedText.ButtonMedium>
          </Option>
          <Option
            wrapper={Custom}
            selected={!slippage.default}
            onSelect={onInputSelect}
            icon={warning && <Warning state={warning} showTooltip={showTooltip} />}
            ref={option}
            tabIndex={-1}
            data-testid="custom-slippage"
          >
            <Row color={warning === 'error' ? 'error' : undefined}>
              <DecimalInput
                size={Math.max(maxSlippageInput.length, 4)}
                value={maxSlippageInput}
                onChange={(input) => processInput(input)}
                placeholder={'0.10'}
                ref={input}
                data-testid="input-slippage"
              />
              %
            </Row>
          </Option>
        </ExpandoContent>
      </Expando>
    </Column>
  )
}
