import React, { Component } from 'react'
import { Button } from '@dhis2/ui/core'
import { MarginTop } from '../../helpers/helpers'
import styled from 'styled-components'

const SpaceBetween = styled.div`
    justify-content: space-between;
    display: flex;
`

/**
 * Row of buttons.
 */
export class ButtonRow extends Component {
    render() {
        return (
            <MarginTop>
                <SpaceBetween>
                    {this.props.buttons.map(button => (
                        <div
                            key={button.label}
                            title={
                                button.disabled
                                    ? button.disabledTooltip
                                    : button.tooltip
                            }
                        >
                            <Button
                                variant="contained"
                                kind={button.kind}
                                onClick={button.onClick}
                                disabled={button.disabled}
                                icon={button.icon}
                            >
                                {button.label}
                            </Button>
                        </div>
                    ))}
                </SpaceBetween>
            </MarginTop>
        )
    }
}
