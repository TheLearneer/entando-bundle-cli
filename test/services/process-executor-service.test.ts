import { expect, test } from '@oclif/test'
import * as cp from 'node:child_process'
import { ChildProcess } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import * as sinon from 'sinon'
import { InMemoryWritable } from '../../src/utils'

import {
  ProcessExecutorService,
  ParallelProcessExecutorService
} from '../../src/services/process-executor-service'

function getStubProcess() {
  const stubProcess = sinon.createStubInstance(ChildProcess)

  stubProcess.stdout = new PassThrough()
  stubProcess.stderr = new PassThrough()

  // setting real EventEmitter to stub on and emit methods
  const stubProcessAsEventEmitter = stubProcess as EventEmitter
  const eventEmitter = new EventEmitter()
  stubProcessAsEventEmitter.on = eventEmitter.on
  stubProcessAsEventEmitter.emit = eventEmitter.emit

  return stubProcess
}

const CMD_NOT_FOUND_ERROR = new Error('Command not found')
const SIGKILL: NodeJS.Signals = 'SIGKILL'

describe('ProcessExecutorService', () => {
  afterEach(() => {
    sinon.restore()
  })

  const outputStream = new InMemoryWritable()
  const errorStream = new InMemoryWritable()

  const optionsWithStream = {
    command: 'test',
    outputStream: outputStream,
    errorStream: errorStream
  }

  test
    .do(async () => {
      const stubProcess = getStubProcess()
      sinon.stub(cp, 'spawn').returns(stubProcess)
      const promise = ProcessExecutorService.executeProcess(optionsWithStream)
      stubProcess.stdout!.emit('data', 'info message\n')
      stubProcess.stderr!.emit('data', 'error message\n')
      stubProcess.emit('exit', 0, null)
      await promise
    })
    .it('Execute process forwarding streams', () => {
      expect(outputStream.data).to.eq('info message\n')
      expect(errorStream.data).to.eq('error message\n')
    })

  const options = {
    command: 'test'
  }

  test
    .do(async () => {
      const stubProcess = getStubProcess()
      sinon.stub(cp, 'spawn').returns(stubProcess)
      const promise = ProcessExecutorService.executeProcess(options)
      stubProcess.stdout!.emit('data', 'info message')
      stubProcess.stderr!.emit('data', 'error message')
      stubProcess.emit('exit', 0, null)
      await promise
    })
    .it('Execute process ignoring streams')

  test.it('Promise returns process exit status code', async () => {
    const stubProcess = getStubProcess()
    sinon.stub(cp, 'spawn').returns(stubProcess)
    const promise = ProcessExecutorService.executeProcess(options)
    stubProcess.emit('exit', 1, null)
    const result = await promise
    expect(result).to.equal(1)
  })

  test.it('Promise returns signal that killed the process', async () => {
    const stubProcess = getStubProcess()
    sinon.stub(cp, 'spawn').returns(stubProcess)
    const promise = ProcessExecutorService.executeProcess(options)
    stubProcess.emit('exit', null, SIGKILL)
    const result = await promise
    expect(result).to.equal(SIGKILL)
  })

  test.it('Promise returns error that prevented process to start', async () => {
    const stubProcess = getStubProcess()
    sinon.stub(cp, 'spawn').returns(stubProcess)
    const promise = ProcessExecutorService.executeProcess(options)
    stubProcess.emit('error', CMD_NOT_FOUND_ERROR)
    const result = await promise
    expect(result).to.equal(CMD_NOT_FOUND_ERROR)
  })

  test
    .do(async () => {
      const parallelProcessesOptions = [
        { command: 'cmd1' },
        { command: 'cmd2' },
        { command: 'cmd3' },
        { command: 'cmd4' }
      ]

      const stubProcess1 = getStubProcess()
      const stubProcess2 = getStubProcess()
      const stubProcess3 = getStubProcess()
      const stubProcess4 = getStubProcess()

      sinon
        .stub(cp, 'spawn')
        .onCall(0)
        .returns(stubProcess1)
        .onCall(1)
        .returns(stubProcess2)
        .onCall(2)
        .returns(stubProcess3)
        .onCall(3)
        .returns(stubProcess4)

      const parallelExecutor = new ParallelProcessExecutorService(
        parallelProcessesOptions
      )
      const promise = parallelExecutor.execute()

      stubProcess1.emit('exit', 0, null)
      stubProcess2.emit('exit', 1, null)
      stubProcess3.emit('exit', null, SIGKILL)
      stubProcess4.emit('error', CMD_NOT_FOUND_ERROR)

      const results = await promise

      expect(results.length).to.equal(4)
      expect(results[0]).to.equal(0)
      expect(results[1]).to.equal(1)
      expect(results[2]).to.equal(SIGKILL)
      expect(results[3]).to.eql(CMD_NOT_FOUND_ERROR)
    })
    .it('Executes multiple processes in parallel')

  test
    .do(async () => {
      const parallelExecutor = new ParallelProcessExecutorService([])
      const results = await parallelExecutor.execute()
      expect(results.length).to.equal(0)
    })
    .it(
      'ParallelProcessExecutorService returns immediately if empty array is passed'
    )

  test.it(
    'Stream options are ignored if spwaned process has no streams',
    async () => {
      const stubProcess = getStubProcess()
      stubProcess.stdout = null
      stubProcess.stderr = null
      sinon.stub(cp, 'spawn').returns(stubProcess)
      const promise = ProcessExecutorService.executeProcess(options)
      stubProcess.emit('exit', 0, null)
      await promise
    }
  )
})
