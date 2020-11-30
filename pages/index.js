import {
  Form,
  Select,
  InputNumber,
  Input,
  Switch,
  Slider,
  Button,
  message,
  Typography,
  Progress,
  Radio,
  Table,
  Modal,
} from 'antd'

// Custom DatePicker that uses Day.js instead of Moment.js
import DatePicker from '../components/DatePicker'

const FormItem = Form.Item
const Option = Select.Option

const { Title } = Typography
const { Column } = Table

const maxLengthOptions = [
  { label: 'Náhodné', value: 'random' },
  { label: 'Vlastné', value: 'custom' },
]

const MAX_INPUT = 10 ** 8

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

export default function Home() {
  const [maxLengthValueType, setMaxLengthValueType] = React.useState('random')
  const [gameStarted, setGameStarted] = React.useState(false)
  const [maxLengthValue, setMaxLengthValue] = React.useState(0)
  const [vectors, setVectors] = React.useState([])
  const [modalType, setModalType] = React.useState(null)
  const modalInputRef = React.useRef(null)
  const [modalInput, setModalInput] = React.useState(null)

  const win = React.useMemo(
    () => vectors[0] && vectors[0].filled === maxLengthValue,
    [vectors, maxLengthValue],
  )

  React.useEffect(() => {
    if (modalInputRef.current) {
      // not sure why we need timeout here
      setTimeout(() => modalInputRef.current.focus(), 0)
    }
  })

  const modalOkAction = React.useCallback(() => {
    setVectors((v) => [
      {
        key: v.length,
        size: modalInput,
        filled: 0,
        score: (v[0] ? v[0].size : 0) + modalInput,
      },
      ...v,
    ])

    setModalType(null)
  }, [modalInput, setVectors, setModalType])

  const resetGame = React.useCallback(() => {
    if (vectors[0].filled !== maxLengthValue) {
      message.info(`Hľadané maximum vektora bolo: ${maxLengthValue}`)
    }
    setGameStarted(false)
    setTimeout(() => setVectors([]), 500)
  }, [vectors, maxLengthValue, setGameStarted])

  const fillBuilding = React.useCallback(() => {
    let localWin = false
    let newV

    setVectors((v) => {
      if (v.length === 0 || v[0].filled === maxLengthValue) return v

      newV = [...v]
      const toAdd = Math.min(newV[0].size, maxLengthValue)
      localWin = toAdd === maxLengthValue
      newV[0].filled = toAdd
      console.log(newV)
      return newV
    })

    if (localWin) {
      message.success(
        `Vyhral si! Hľadané maximum vektora bolo: ${maxLengthValue}. Tvoje skóre: ${newV[0].score}`,
      )
    }
  }, [setVectors, maxLengthValue])

  const keyPressHandler = ({ key }) => {
    if (gameStarted && document.activeElement.tagName === 'BODY') {
      if (key === 'k' && !win) setModalType('buy')
      else if (key === 'n') fillBuilding()
      else if (key === 'r') resetGame()
    }
  }

  React.useEffect(() => {
    window.addEventListener('keypress', keyPressHandler)

    return () => {
      window.removeEventListener('keypress', keyPressHandler)
    }
  }, [gameStarted, win])

  return (
    <div>
      <Title
        style={{
          textAlign: 'center',
          paddingTop: '80px',
        }}
      >
        Prask interaktivka
      </Title>

      <div>
        <Form layout="horizontal">
          <FormItem
            label="Maximum vektora"
            labelCol={{ span: 8 }}
            style={{ marginBottom: 0 }}
          >
            <Radio.Group
              options={maxLengthOptions}
              onChange={(e) => setMaxLengthValueType(e.target.value)}
              value={maxLengthValueType}
              optionType="default"
              buttonStyle="solid"
              disabled={gameStarted}
            />

            <InputNumber
              size="large"
              min={1}
              max={MAX_INPUT}
              style={{
                width: 100,
                opacity: maxLengthValueType === 'custom' ? 1 : 0,
                visibility:
                  maxLengthValueType === 'custom' ? 'visible' : 'hidden',
                transition: `opacity 0.5s ease-in-out, visibility 0s linear ${
                  maxLengthValueType === 'custom' ? 0 : 0.5
                }s`,
                marginLeft: 8,
                width: 160,
              }}
              disabled={gameStarted}
              defaultValue={3}
              name="inputNumber"
              value={maxLengthValue}
              onChange={(v) => setMaxLengthValue(v)}
            />
          </FormItem>

          <FormItem
            style={{
              marginBottom: 0,
              marginTop: 16,
              visibility: !gameStarted ? 'visible' : 'hidden',
              transition: `opacity 0.5s ease-in-out, visibility 0s linear ${
                !gameStarted ? 0 : 0.5
              }s`,
              opacity: gameStarted ? 0 : 1,
            }}
            wrapperCol={{ span: 8, offset: 8 }}
          >
            <Button
              type="primary"
              size="large"
              block
              onClick={() => {
                if (maxLengthValueType === 'random') {
                  setMaxLengthValue(
                    10 ** getRandomInt(8) + getRandomInt(100) ** 2,
                  )
                }
                setGameStarted(true)
              }}
            >
              Začať hru
            </Button>
          </FormItem>

          <div
            style={{
              opacity: gameStarted ? 1 : 0,
              visibility: gameStarted ? 'visible' : 'hidden',
              transition: `opacity 0.5s ease-in-out, visibility 0s linear ${
                gameStarted ? 0 : 0.5
              }s`,
            }}
          >
            <FormItem
              label="Budovy"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 12 }}
              style={{ marginBottom: 0 }}
            >
              <Table
                dataSource={vectors}
                sticky
                scroll={{ y: 250 }}
                size="medium"
              >
                <Column
                  width={250}
                  title="Budova"
                  render={(_text, record) => (
                    <Progress
                      style={{ paddingRight: 16 }}
                      strokeLinecap="round"
                      percent={
                        Math.round((record.filled / record.size) * 100 * 100) /
                        100
                      }
                    />
                  )}
                />
                <Column
                  title="Naplnenie"
                  render={(_text, record) =>
                    `${record.filled} / ${record.size}`
                  }
                />
                <Column title="Skóre" dataIndex="score" />
              </Table>
              ,
            </FormItem>

            <FormItem wrapperCol={{ offset: 8 }} style={{ marginBottom: 0 }}>
              <Button
                size="large"
                type="primary"
                onClick={() => setModalType('buy')}
                disabled={win}
              >
                (K)úp novú budovu
              </Button>
              <Button
                size="large"
                style={{ marginLeft: 8 }}
                onClick={fillBuilding}
                disabled={vectors.length === 0 || win}
              >
                (N)aplň aktuálnu budovu
              </Button>
              <Button
                size="large"
                type="primary"
                style={{ marginLeft: 8 }}
                danger
                onClick={resetGame}
              >
                (R)eset
              </Button>
            </FormItem>
          </div>
        </Form>

        <Modal
          visible={!!modalType}
          title={'Nákup budovy'}
          keyboard
          onCancel={() => setModalType(null)}
          footer={[
            <Button key="back" onClick={() => setModalType(null)}>
              Zrušiť
            </Button>,
            <Button key="ok" type="primary" onClick={modalOkAction}>
              OK
            </Button>,
          ]}
        >
          <InputNumber
            ref={modalInputRef}
            placeholder="Koľko?"
            style={{ width: '100%' }}
            min={1}
            max={MAX_INPUT}
            value={modalInput}
            onChange={setModalInput}
            onKeyDown={({ key }) => {
              if (key === 'Enter') modalOkAction()
            }}
          />
        </Modal>
      </div>
    </div>
  )
}
