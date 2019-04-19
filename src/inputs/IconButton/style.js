import styled from 'styled-components'

export const IconContainer = styled.div`
    height: 32px;
    margin-right: 8px;
    margin-top: 12px;
    padding: 12px;
    border-radius: 50%;
    cursor: pointer;
    &:hover {
        & .ui_icon_base_1s8vb {
            color: var(--primary800);
        }
        background-color: rgba(0, 0, 0, 0.08);
    }
    & .ui_icon_base_1s8vb {
        font-size: 2rem;
        cursor: pointer;
    }
`