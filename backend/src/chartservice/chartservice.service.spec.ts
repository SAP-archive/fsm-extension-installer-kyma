import { Test, TestingModule } from '@nestjs/testing';
import fse = require('fs-extra');
import { ChartserviceService } from './chartservice.service';
import {CHART_CACHE_PATH} from "../utils/constants";
import {ChartConfigData} from "../utils/interfaces/chartconfigdata.interface";

jest.mock('download-git-repo');
jest.mock('uuid');
import download = require('download-git-repo');
import {v4 as uuidv4} from 'uuid';

describe('ChartserviceService', () => {
  let service: ChartserviceService;

  // Remove chart_cache folder if this folder is existing.
  fse.removeSync(CHART_CACHE_PATH);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartserviceService],
    }).compile();

    service = module.get<ChartserviceService>(ChartserviceService);
  });

  it('should be called for removeDownloadedPath method', () => {
    // Existing CHART_CACHE_PATH folder
    service.removeDownloadedPath(CHART_CACHE_PATH);
    expect(fse.existsSync(CHART_CACHE_PATH)).toEqual(false);

    // Not exist CHART_CACHE_PATH folder, cover other branch
    service.removeDownloadedPath(CHART_CACHE_PATH);
    expect(fse.existsSync(CHART_CACHE_PATH)).toEqual(false);
  });

  it('should successfully download chart from github repo', async () => {
    const chartConfigData = {
      "repository": "https://github.com",
      "ref": "master",
      "path": "helm/"
    } as ChartConfigData;
    const mockId = 'fd05ed61-faad-4868-8039-e5cd460b7e26';

    download.mockImplementation((repo, dest, opts, fn) => {
      console.log(repo);
      console.log(dest);
      console.log(opts);
      fn(null);
    });
    uuidv4.mockImplementation(() => {return mockId});

    await expect(service.downloadChartFromGithubRepo(chartConfigData)).resolves.toEqual(CHART_CACHE_PATH + mockId);
  });

  it('should failed download chart from github repo', async () => {
    const chartConfigData = {
      "repository": "https://github.com",
      "ref": undefined,
      "path": "helm/"
    } as ChartConfigData;
    const error = new Error('test reject branch for download method');

    download.mockImplementation((repo, dest, opts, fn) => {
      console.log(repo);
      console.log(dest);
      console.log(opts);
      fn(error);
    });

    await expect(service.downloadChartFromGithubRepo(chartConfigData)).rejects.toThrow(error);
  });
});
