import React from 'react'
import styled from 'styled-components'
import { Card } from '@dhis2/ui/core'
import { ButtonRow, Margin, Text } from '../../'

const Background = styled.div`
    display: flex;
    position: fixed;
    justify-content: center;
    align-items: baseline;
    z-index: 1;
    padding-top: 62px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.4);
`

const BottomCard = styled(Card)`
    width: 30%;
`

export const ModalPopup = props => (
    <Background>
        <BottomCard>
            <Margin>
                <Text>{props.text}</Text>
                <ButtonRow
                    buttons={[
                        {
                            label: 'No',
                            kind:'destructive',
                            icon:'clear',
                            onClick: () => props.onClick(false)
                        },
                        {
                            label: 'Yes',
                            kind: 'primary',
                            icon:'done',
                            focus: true,
                            onClick: () => props.onClick(true)
                        }
                    ]}
                />
            </Margin>
        </BottomCard>
    </Background>
)